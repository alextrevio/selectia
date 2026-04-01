import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  const orgId = userData?.org_id

  const [
    { count: totalVacancies },
    { count: activeVacancies },
    { count: totalCandidates },
    { count: hiredCount },
  ] = await Promise.all([
    supabase.from('vacancies').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('vacancies').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'active'),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('stage', 'hired'),
  ])

  return NextResponse.json({
    totalVacancies: totalVacancies || 0,
    activeVacancies: activeVacancies || 0,
    totalCandidates: totalCandidates || 0,
    hiredCount: hiredCount || 0,
  })
}
