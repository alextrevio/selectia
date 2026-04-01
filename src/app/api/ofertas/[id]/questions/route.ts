import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('killer_questions')
    .select('*')
    .eq('vacancy_id', id)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questions } = await request.json()

  // Delete existing questions
  await supabase.from('killer_questions').delete().eq('vacancy_id', id)

  // Insert new questions
  if (questions && questions.length > 0) {
    const toInsert = questions.map((q: Record<string, unknown>, i: number) => ({
      vacancy_id: id,
      question_text: q.question_text,
      question_type: q.question_type || 'text',
      expected_answer: q.expected_answer || null,
      weight: q.weight || 10,
      is_eliminatory: q.is_eliminatory || false,
      sort_order: i,
      options: q.options || null,
    }))

    const { error } = await supabase.from('killer_questions').insert(toInsert)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
