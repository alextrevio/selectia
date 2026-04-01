import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stage } = await request.json()

  const { data, error } = await supabase
    .from('candidates')
    .update({
      stage,
      stage_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log activity
  const { data: candidate } = await supabase.from('candidates').select('org_id').eq('id', id).single()
  if (candidate) {
    await supabase.from('activity_log').insert({
      org_id: candidate.org_id,
      candidate_id: id,
      user_id: user.id,
      action: 'stage_changed',
      details: { new_stage: stage },
    })
  }

  return NextResponse.json(data)
}
