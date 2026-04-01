import { createClient } from '@/lib/supabase/server'
import { OfertasListClient } from '@/components/ofertas/ofertas-list-client'
import type { Vacancy } from '@/types/database'

export default async function OfertasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const { data: ofertas } = await supabase
    .from('vacancies')
    .select('*')
    .eq('org_id', userData?.org_id)
    .order('created_at', { ascending: false })

  return <OfertasListClient ofertas={(ofertas as Vacancy[]) || []} />
}
