import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateAgentResponse, generateCandidateSummary } from '@/lib/ai/recruiter-agent'
import { sendText } from '@/lib/whatsapp/zavu-client'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const from = body.from || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from
    const text = body.text?.body || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body
    const messageId = body.id || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id

    if (!from || !text) {
      return NextResponse.json({ status: 'no_message' })
    }

    const supabase = await createServiceClient()

    // Find candidate by phone
    let { data: candidate } = await supabase
      .from('candidates')
      .select('*, vacancy:vacancies(*)')
      .eq('phone', from)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // If no candidate, check if text contains vacancy code
    if (!candidate) {
      const codeMatch = text.match(/VAC-[a-f0-9]{6}/i)
      if (codeMatch) {
        const { data: vacancy } = await supabase
          .from('vacancies')
          .select('*')
          .eq('vacancy_code', codeMatch[0].toUpperCase())
          .eq('status', 'active')
          .single()

        if (vacancy) {
          const { data: newCandidate } = await supabase
            .from('candidates')
            .insert({
              org_id: vacancy.org_id,
              vacancy_id: vacancy.id,
              phone: from,
              source: 'whatsapp',
            })
            .select()
            .single()

          candidate = { ...newCandidate, vacancy }
        }
      }

      if (!candidate) {
        return NextResponse.json({ status: 'no_candidate' })
      }
    }

    // Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('candidate_id', candidate.id)
      .in('status', ['active', 'waiting_human'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!conversation) {
      const { data: questions } = await supabase
        .from('killer_questions')
        .select('*')
        .eq('vacancy_id', candidate.vacancy_id)
        .order('sort_order')

      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          org_id: candidate.org_id,
          candidate_id: candidate.id,
          vacancy_id: candidate.vacancy_id,
          whatsapp_chat_id: from,
          questions_total: questions?.length || 0,
        })
        .select()
        .single()

      conversation = newConv
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Save candidate message
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'candidate',
      content: text,
      whatsapp_message_id: messageId,
    })

    // If waiting for human, don't auto-respond
    if (conversation.status === 'waiting_human') {
      return NextResponse.json({ status: 'waiting_human' })
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at')

    // Get killer questions
    const { data: questions } = await supabase
      .from('killer_questions')
      .select('*')
      .eq('vacancy_id', candidate.vacancy_id)
      .order('sort_order')

    const vacancy = candidate.vacancy || await supabase
      .from('vacancies')
      .select('*')
      .eq('id', candidate.vacancy_id)
      .single()
      .then((r) => r.data)

    if (!vacancy) {
      return NextResponse.json({ status: 'no_vacancy' })
    }

    // Generate AI response
    const agentResponse = await generateAgentResponse({
      vacancy,
      candidate,
      questions: questions || [],
      conversationHistory: messages || [],
      currentQuestionIndex: conversation.current_question_index,
    })

    // Save agent message
    const { data: agentMsg } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'agent',
      content: agentResponse.message,
      is_killer_question: agentResponse.score !== null,
      killer_question_id: questions?.[conversation.current_question_index]?.id || null,
      candidate_answer_score: agentResponse.score,
    }).select().single()

    // Update conversation progress
    const updates: Record<string, unknown> = {
      last_message_at: new Date().toISOString(),
      questions_asked: conversation.questions_asked + (agentResponse.score !== null ? 1 : 0),
    }

    if (agentResponse.score !== null) {
      updates.current_question_index = conversation.current_question_index + 1
    }

    if (agentResponse.isComplete) {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()

      // Generate summary
      const summary = await generateCandidateSummary({
        vacancy,
        candidate,
        questions: questions || [],
        conversationHistory: [...(messages || []), ...(agentMsg ? [agentMsg] : [])],
        currentQuestionIndex: conversation.current_question_index + 1,
      })

      updates.ai_summary = summary.summary
      updates.ai_recommendation = summary.recommendation

      // Update candidate score
      await supabase.rpc('update_candidate_score', { p_candidate_id: candidate.id })
      await supabase.rpc('auto_advance_candidate', { p_candidate_id: candidate.id })
    }

    await supabase.from('conversations').update(updates).eq('id', conversation.id)

    // Send response via WhatsApp
    await sendText(from, agentResponse.message)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
