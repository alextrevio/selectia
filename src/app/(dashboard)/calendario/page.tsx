import { createClient } from '@/lib/supabase/server'
import { CalendarioClient } from '@/components/calendario/calendario-client'
import type { InterviewWithRelations, Vacancy, Candidate } from '@/types/database'

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const orgId = userData?.org_id

  const [{ data: interviews }, { data: vacancies }, { data: candidates }] = await Promise.all([
    supabase
      .from('interviews')
      .select('*, candidate:candidates(id, full_name, phone), vacancy:vacancies(id, title)')
      .eq('org_id', orgId)
      .order('scheduled_at'),
    supabase
      .from('vacancies')
      .select('id, title')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('title'),
    supabase
      .from('candidates')
      .select('id, full_name, vacancy_id')
      .eq('org_id', orgId)
      .order('full_name'),
  ])

  return (
    <CalendarioClient
      interviews={(interviews as InterviewWithRelations[]) || []}
      vacancies={(vacancies as Pick<Vacancy, 'id' | 'title'>[]) || []}
      candidates={(candidates as Pick<Candidate, 'id' | 'full_name' | 'vacancy_id'>[]) || []}
    />
  )
}
