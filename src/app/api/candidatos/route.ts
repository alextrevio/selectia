import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  const { data, error } = await supabase
    .from('candidates')
    .select('*, vacancy:vacancies(id, title)')
    .eq('org_id', userData?.org_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  const body = await request.json()

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      org_id: userData?.org_id,
      vacancy_id: body.vacancy_id || null,
      full_name: body.full_name,
      phone: body.phone || null,
      email: body.email || null,
      location: body.location || null,
      skills: body.skills || [],
      stage: body.stage || 'new',
      source: body.source || 'manual',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
