import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { processMessage, buildSystemPrompt } from '@/lib/ai/recruiter-agent'
import { sendWhatsAppText } from '@/lib/whatsapp/zavu-client'
import type { KillerQuestion, Vacancy, Message } from '@/types/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // a) Extract phone + text from Zavu webhook body
    const phone: string | undefined =
      body.from || body.phone || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from
    const text: string | undefined =
      body.text?.body || body.text || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body
    const messageId: string =
      body.id || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id || `msg-${Date.now()}`

    // b) Ignore if no text or no phone
    if (!phone || !text) {
      return NextResponse.json({ status: 'no_message' })
    }

    const supabase = await createServiceClient()

    // c) Detect vacancy_code in message
    const codeMatch = text.match(/VAC-[A-Z0-9]{6}/i)

    let vacancy: Vacancy | null = null
    let orgId: string | null = null
    let candidateId: string | null = null
    let conversationId: string | null = null
    let isNewConversation = false

    // d) If has code: find vacancy
    if (codeMatch) {
      const { data: foundVacancy } = await supabase
        .from('vacancies')
        .select('*')
        .eq('vacancy_code', codeMatch[0].toUpperCase())
        .eq('status', 'active')
        .single()

      if (foundVacancy) {
        vacancy = foundVacancy as Vacancy
        orgId = vacancy.org_id
      }
    }

    // e) If no code: find existing active conversation by phone
    if (!vacancy) {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*, candidate:candidates(*, vacancy:vacancies(*))')
        .eq('whatsapp_chat_id', phone)
        .in('status', ['active', 'waiting_human'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingConv) {
        conversationId = existingConv.id
        candidateId = existingConv.candidate_id
        orgId = existingConv.org_id

        const cand = existingConv.candidate as Record<string, unknown> | null
        if (cand?.vacancy) {
          vacancy = cand.vacancy as Vacancy
        }

        // If waiting_human, save message but don't auto-respond
        if (existingConv.status === 'waiting_human') {
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'candidate',
            content: text,
            whatsapp_message_id: messageId,
          })
          return NextResponse.json({ status: 'waiting_human' })
        }
      }
    }

    // f) If no conversation and no code: reply with instructions
    if (!vacancy && !conversationId) {
      try {
        await sendWhatsAppText(
          phone,
          'Hola 👋 Para aplicar a una vacante, envía el código que viste en el anuncio (ej: VAC-ABC123).'
        )
      } catch (err) {
        console.error('Failed to send instruction message:', err)
      }
      return NextResponse.json({ status: 'no_vacancy_code' })
    }

    // g) If vacancy but no conversation: create candidate + conversation + send greeting
    if (vacancy && !conversationId) {
      // Check if candidate already exists for this phone + vacancy
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('org_id', orgId)
        .eq('phone', phone)
        .eq('vacancy_id', vacancy.id)
        .single()

      if (existingCandidate) {
        candidateId = existingCandidate.id
      } else {
        const { data: newCandidate } = await supabase
          .from('candidates')
          .insert({
            org_id: orgId,
            vacancy_id: vacancy.id,
            phone,
            source: 'whatsapp',
            stage: 'new',
          })
          .select()
          .single()

        if (!newCandidate) {
          return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 })
        }
        candidateId = newCandidate.id

        // Update vacancy candidate count
        await supabase
          .from('vacancies')
          .update({ total_candidates: (vacancy!.total_candidates || 0) + 1 })
          .eq('id', vacancy!.id)
      }

      // Get killer questions count
      const { data: questions } = await supabase
        .from('killer_questions')
        .select('id')
        .eq('vacancy_id', vacancy.id)

      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          org_id: orgId,
          candidate_id: candidateId,
          vacancy_id: vacancy.id,
          whatsapp_chat_id: phone,
          status: 'active',
          questions_total: questions?.length || 0,
        })
        .select()
        .single()

      if (!newConv) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }
      conversationId = newConv.id
      isNewConversation = true

      // Log activity
      await supabase.from('activity_log').insert({
        org_id: orgId,
        candidate_id: candidateId,
        action: 'created',
        details: { source: 'whatsapp', vacancy_code: codeMatch?.[0] },
      })
    }

    if (!conversationId || !candidateId) {
      return NextResponse.json({ error: 'Missing conversation or candidate' }, { status: 500 })
    }

    // h) Save candidate's message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'candidate',
      content: text,
      whatsapp_message_id: messageId,
    })

    // If we don't have vacancy yet, try to load it
    if (!vacancy && candidateId) {
      const { data: cand } = await supabase
        .from('candidates')
        .select('vacancy_id')
        .eq('id', candidateId)
        .single()
      if (cand?.vacancy_id) {
        const { data: v } = await supabase
          .from('vacancies')
          .select('*')
          .eq('id', cand.vacancy_id)
          .single()
        vacancy = v as Vacancy | null
      }
    }

    if (!vacancy) {
      return NextResponse.json({ status: 'no_vacancy' })
    }

    // i) Load history (last 30 messages) + killer questions
    const [{ data: historyMsgs }, { data: killerQuestions }, { data: conversation }] =
      await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at')
          .limit(30),
        supabase
          .from('killer_questions')
          .select('*')
          .eq('vacancy_id', vacancy.id)
          .order('sort_order'),
        supabase.from('conversations').select('*').eq('id', conversationId).single(),
      ])

    const history = (historyMsgs as Message[]) || []
    const questions = (killerQuestions as KillerQuestion[]) || []

    // Get org name for prompt
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      org?.name || 'Empresa',
      vacancy,
      questions
    )

    // For new conversations, if there's a greeting configured, send it first
    if (isNewConversation && vacancy.agent_greeting) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'agent',
        content: vacancy.agent_greeting,
      })
      try {
        await sendWhatsAppText(phone, vacancy.agent_greeting)
      } catch (err) {
        console.error('Failed to send greeting:', err)
      }
    }

    // j) Call processMessage with Claude Haiku
    const agentResult = await processMessage(text, systemPrompt, history, questions)

    // k) Save agent response
    const agentMsgData: Record<string, unknown> = {
      conversation_id: conversationId,
      role: 'agent',
      content: agentResult.response,
    }

    // l) If killer_question_answered: mark in message, update score
    if (agentResult.killer_question_answered) {
      const kqa = agentResult.killer_question_answered
      agentMsgData.is_killer_question = true
      agentMsgData.killer_question_id = kqa.question_id
      agentMsgData.candidate_answer_score = kqa.score
    }

    await supabase.from('messages').insert(agentMsgData)

    // Update conversation progress
    const convUpdates: Record<string, unknown> = {
      last_message_at: new Date().toISOString(),
    }

    if (agentResult.killer_question_answered) {
      convUpdates.questions_asked = (conversation?.questions_asked || 0) + 1
      convUpdates.current_question_index = (conversation?.current_question_index || 0) + 1
    }

    // m) If extracted_data: update candidate
    if (agentResult.extracted_data) {
      const d = agentResult.extracted_data
      const candidateUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (d.name) candidateUpdates.full_name = d.name
      if (d.age) candidateUpdates.age = d.age
      if (d.location) candidateUpdates.location = d.location
      if (d.email) candidateUpdates.email = d.email

      await supabase.from('candidates').update(candidateUpdates).eq('id', candidateId)
    }

    // n) If complete: calculate score, auto-advance, close conversation
    if (agentResult.next_action === 'complete') {
      convUpdates.status = 'completed'
      convUpdates.completed_at = new Date().toISOString()

      // Calculate score via RPC
      const { error: scoreErr } = await supabase.rpc('update_candidate_score', { p_candidate_id: candidateId })
      if (scoreErr) console.error('Score RPC error:', scoreErr)

      // Auto-advance via RPC
      const { error: advanceErr } = await supabase.rpc('auto_advance_candidate', { p_candidate_id: candidateId })
      if (advanceErr) console.error('Auto-advance RPC error:', advanceErr)

      // Log activity
      await supabase.from('activity_log').insert({
        org_id: orgId,
        candidate_id: candidateId,
        action: 'screening_completed',
        details: { questions_answered: convUpdates.questions_asked },
      })
    }

    // o) If reject: move to rejected, close
    if (agentResult.next_action === 'reject') {
      convUpdates.status = 'completed'
      convUpdates.completed_at = new Date().toISOString()

      await supabase
        .from('candidates')
        .update({
          stage: 'rejected',
          rejection_reason: 'No cumple requisitos (evaluación automática)',
          stage_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId)

      await supabase.from('activity_log').insert({
        org_id: orgId,
        candidate_id: candidateId,
        action: 'stage_changed',
        details: { new_stage: 'rejected', reason: 'auto_reject' },
      })
    }

    // p) If escalate: set waiting_human
    if (agentResult.next_action === 'escalate') {
      convUpdates.status = 'waiting_human'

      await supabase.from('activity_log').insert({
        org_id: orgId,
        candidate_id: candidateId,
        action: 'escalated_to_human',
        details: {},
      })
    }

    // Update conversation
    await supabase.from('conversations').update(convUpdates).eq('id', conversationId)

    // Move to screening if still 'new'
    if (agentResult.next_action === 'ask_next') {
      const { data: currentCand } = await supabase
        .from('candidates')
        .select('stage')
        .eq('id', candidateId)
        .single()
      if (currentCand?.stage === 'new') {
        await supabase
          .from('candidates')
          .update({
            stage: 'screening',
            stage_changed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', candidateId)
      }
    }

    // q) Send response via Zavu
    try {
      await sendWhatsAppText(phone, agentResult.response)
    } catch (err) {
      console.error('Failed to send WhatsApp response:', err)
    }

    // r) Return 200
    return NextResponse.json({ status: 'ok', action: agentResult.next_action })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Webhook verification (Meta/Zavu)
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
