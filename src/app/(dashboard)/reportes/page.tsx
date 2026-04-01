import { createClient } from '@/lib/supabase/server'
import { ReportesClient } from '@/components/reportes/reportes-client'
import type { ActivityLog, Vacancy, CandidateStage } from '@/types/database'

export default async function ReportesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const orgId = userData?.org_id

  const [
    { data: candidates },
    { data: vacancies },
    { data: interviews },
    { data: activities },
  ] = await Promise.all([
    supabase
      .from('candidates')
      .select('id, stage, score, source, vacancy_id, created_at')
      .eq('org_id', orgId),
    supabase
      .from('vacancies')
      .select('id, title, status')
      .eq('org_id', orgId)
      .order('title'),
    supabase
      .from('interviews')
      .select('id, status, scheduled_at')
      .eq('org_id', orgId),
    supabase
      .from('activity_log')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <ReportesClient
      candidates={candidates || []}
      vacancies={(vacancies as Pick<Vacancy, 'id' | 'title' | 'status'>[]) || []}
      interviews={interviews || []}
      activities={(activities as ActivityLog[]) || []}
    />
  )
}
