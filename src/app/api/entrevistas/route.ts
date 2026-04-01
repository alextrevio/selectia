import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  const { data, error } = await supabase
    .from('interviews')
    .select('*, candidate:candidates(id, full_name, phone), vacancy:vacancies(id, title)')
    .eq('org_id', userData?.org_id)
    .order('scheduled_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  const body = await request.json()

  // Get candidate's vacancy_id
  const { data: candidate } = await supabase
    .from('candidates')
    .select('vacancy_id')
    .eq('id', body.candidate_id)
    .single()

  const { data, error } = await supabase
    .from('interviews')
    .insert({
      org_id: userData?.org_id,
      candidate_id: body.candidate_id,
      vacancy_id: candidate?.vacancy_id || null,
      scheduled_by: user.id,
      title: body.title,
      interview_type: body.interview_type || 'in_person',
      scheduled_at: body.scheduled_at,
      duration_minutes: parseInt(body.duration_minutes) || 30,
      location: body.location || null,
      meeting_url: body.meeting_url || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
