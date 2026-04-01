import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { subDays } from 'date-fns'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  const orgId = userData?.org_id

  const { searchParams } = new URL(request.url)
  const period = parseInt(searchParams.get('period') || '30')
  const vacancyId = searchParams.get('vacancy_id')
  const cutoff = subDays(new Date(), period).toISOString()

  let candidateQuery = supabase
    .from('candidates')
    .select('id, stage, score, source, vacancy_id, created_at')
    .eq('org_id', orgId)
    .gte('created_at', cutoff)

  if (vacancyId && vacancyId !== 'all') {
    candidateQuery = candidateQuery.eq('vacancy_id', vacancyId)
  }

  const [
    { data: candidates },
    { data: vacancies },
    { data: interviews },
    { data: activities },
  ] = await Promise.all([
    candidateQuery,
    supabase.from('vacancies').select('id, title, status').eq('org_id', orgId).order('title'),
    supabase.from('interviews').select('id, status, scheduled_at').eq('org_id', orgId).gte('scheduled_at', cutoff),
    supabase.from('activity_log').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(50),
  ])

  return NextResponse.json({
    candidates: candidates || [],
    vacancies: vacancies || [],
    interviews: interviews || [],
    activities: activities || [],
  })
}
