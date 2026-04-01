import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CandidatoProfile } from '@/components/candidatos/candidato-profile'
import { ChatPanel } from '@/components/conversations/chat-panel'
import type { Candidate, Message } from '@/types/database'

export default async function CandidatoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: candidato } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (!candidato) notFound()

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('candidate_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let messages: Message[] = []
  if (conversation) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at')
    messages = (data as Message[]) || []
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <CandidatoProfile candidato={candidato as Candidate} />
      </div>
      <div className="lg:col-span-2">
        <ChatPanel
          conversationId={conversation?.id}
          candidateId={id}
          initialMessages={messages}
        />
      </div>
    </div>
  )
}
