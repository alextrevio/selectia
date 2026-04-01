import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/calendario/calendar-view'
import { NuevaEntrevistaModal } from '@/components/calendario/nueva-entrevista-modal'
import type { InterviewWithRelations } from '@/types/database'

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const { data: interviews } = await supabase
    .from('interviews')
    .select('*, candidate:candidates(id, full_name, phone), vacancy:vacancies(id, title)')
    .eq('org_id', userData?.org_id)
    .order('scheduled_at')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">Entrevistas programadas</p>
        </div>
        <NuevaEntrevistaModal />
      </div>
      <CalendarView interviews={(interviews as InterviewWithRelations[]) || []} />
    </div>
  )
}
