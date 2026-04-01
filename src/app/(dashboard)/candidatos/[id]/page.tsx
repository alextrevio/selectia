import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CandidatoDetailClient } from '@/components/candidatos/candidato-detail-client'
import type { Candidate, Vacancy, Message, Conversation, ActivityLog } from '@/types/database'

export default async function CandidatoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: candidato } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (!candidato) notFound()

  const [
    { data: vacancy },
    { data: conversation },
    { data: activities },
  ] = await Promise.all([
    candidato.vacancy_id
      ? supabase.from('vacancies').select('id, title').eq('id', candidato.vacancy_id).single()
      : { data: null },
    supabase
      .from('conversations')
      .select('*')
      .eq('candidate_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('activity_log')
      .select('*')
      .eq('candidate_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

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
    <CandidatoDetailClient
      candidato={candidato as Candidate}
      vacancy={vacancy as Pick<Vacancy, 'id' | 'title'> | null}
      conversation={conversation as Conversation | null}
      messages={messages}
      activities={(activities as ActivityLog[]) || []}
    />
  )
}
