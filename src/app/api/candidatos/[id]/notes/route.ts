import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { note } = await request.json()

  const { data: candidate } = await supabase
    .from('candidates')
    .select('notes, org_id')
    .eq('id', id)
    .single()

  const existingNotes = candidate?.notes || ''
  const timestamp = new Date().toISOString()
  const updatedNotes = `${existingNotes}\n[${timestamp}] ${note}`.trim()

  const { error } = await supabase
    .from('candidates')
    .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (candidate?.org_id) {
    await supabase.from('activity_log').insert({
      org_id: candidate.org_id,
      candidate_id: id,
      user_id: user.id,
      action: 'note_added',
      details: { note },
    })
  }

  return NextResponse.json({ success: true })
}
