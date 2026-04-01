import { createClient } from '@/lib/supabase/server'
import { CandidatosListClient } from '@/components/candidatos/candidatos-list-client'
import type { CandidateWithVacancy, Vacancy } from '@/types/database'

export default async function CandidatosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const orgId = userData?.org_id

  const [{ data: candidatos }, { data: vacancies }] = await Promise.all([
    supabase
      .from('candidates')
      .select('*, vacancy:vacancies(id, title)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false }),
    supabase
      .from('vacancies')
      .select('id, title')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('title'),
  ])

  return (
    <CandidatosListClient
      candidatos={(candidatos as CandidateWithVacancy[]) || []}
      vacancies={(vacancies as Pick<Vacancy, 'id' | 'title'>[]) || []}
    />
  )
}
