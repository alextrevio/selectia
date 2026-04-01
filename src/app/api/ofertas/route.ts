import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  const { data, error } = await supabase
    .from('vacancies')
    .select('*')
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
    .from('vacancies')
    .insert({
      org_id: userData?.org_id,
      created_by: user.id,
      title: body.title,
      description: body.description || null,
      requirements: body.requirements || null,
      location: body.location || null,
      department: body.department || null,
      modality: body.modality || 'on_site',
      level: body.level || null,
      salary_min: body.salary_min ? parseFloat(body.salary_min) : null,
      salary_max: body.salary_max ? parseFloat(body.salary_max) : null,
      employment_type: body.employment_type || 'full_time',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
