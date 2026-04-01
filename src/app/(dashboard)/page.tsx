import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { OfertasActivas } from '@/components/dashboard/ofertas-activas'
import { PipelineSummary } from '@/components/dashboard/pipeline-summary'
import { CandidatosRecientes } from '@/components/dashboard/candidatos-recientes'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const orgId = userData?.org_id

  const [
    { count: totalVacancies },
    { count: activeVacancies },
    { count: totalCandidates },
    { data: recentCandidates },
    { data: activeOffers },
  ] = await Promise.all([
    supabase.from('vacancies').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('vacancies').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'active'),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('candidates').select('*, vacancy:vacancies(id, title)').eq('org_id', orgId).order('created_at', { ascending: false }).limit(5),
    supabase.from('vacancies').select('*').eq('org_id', orgId).eq('status', 'active').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu proceso de reclutamiento</p>
      </div>
      <DashboardStats
        totalVacancies={totalVacancies || 0}
        activeVacancies={activeVacancies || 0}
        totalCandidates={totalCandidates || 0}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <OfertasActivas ofertas={activeOffers || []} />
        <PipelineSummary />
      </div>
      <CandidatosRecientes candidatos={recentCandidates || []} />
    </div>
  )
}
