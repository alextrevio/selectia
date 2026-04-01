import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWhatsAppText } from '@/lib/whatsapp/zavu-client'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, role } = await request.json()

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: id,
      role: role || 'human',
      content,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send via WhatsApp if human takeover
  if (role === 'human') {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('candidate_id')
      .eq('id', id)
      .single()

    if (conversation) {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('phone')
        .eq('id', conversation.candidate_id)
        .single()

      if (candidate?.phone) {
        try {
          await sendWhatsAppText(candidate.phone, content)
        } catch (err) {
          console.error('WhatsApp send error:', err)
        }
      }
    }

    await supabase
      .from('conversations')
      .update({ status: 'active', last_message_at: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.json(message, { status: 201 })
}
