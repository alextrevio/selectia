import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  const orgId = userData?.org_id

  const [
    { data: candidates },
    { data: vacancies },
    { data: interviews },
  ] = await Promise.all([
    supabase.from('candidates').select('stage, score, created_at').eq('org_id', orgId),
    supabase.from('vacancies').select('status, total_candidates, created_at').eq('org_id', orgId),
    supabase.from('interviews').select('status, scheduled_at').eq('org_id', orgId),
  ])

  return NextResponse.json({
    candidates: candidates || [],
    vacancies: vacancies || [],
    interviews: interviews || [],
  })
}
