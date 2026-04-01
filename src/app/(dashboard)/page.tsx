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
    .select('org_id, full_name')
    .eq('id', user.id)
    .single()

  const orgId = userData?.org_id
  const firstName = userData?.full_name?.split(' ')[0] || 'Usuario'

  // Current month range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  const [
    { count: totalCandidates },
    { count: activeVacancies },
    { count: inProcessCandidates },
    { count: hiredCandidates },
    { count: prevMonthCandidates },
    { count: prevActiveVacancies },
    { count: prevInProcess },
    { count: prevHired },
    { data: recentCandidates },
    { data: activeOffers },
    { data: allCandidates },
  ] = await Promise.all([
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('vacancies').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'active'),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId).in('stage', ['screening', 'qualified', 'interview', 'offer']),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('stage', 'hired'),
    // Previous month counts for comparison
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId).gte('created_at', startOfPrevMonth).lte('created_at', endOfPrevMonth),
    supabase.from('vacancies').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'active').lte('created_at', endOfPrevMonth),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId).in('stage', ['screening', 'qualified', 'interview', 'offer']).lte('created_at', endOfPrevMonth),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('stage', 'hired').lte('created_at', endOfPrevMonth),
    // Recent candidates
    supabase.from('candidates').select('*, vacancy:vacancies(id, title)').eq('org_id', orgId).order('created_at', { ascending: false }).limit(5),
    // Active offers
    supabase.from('vacancies').select('*').eq('org_id', orgId).eq('status', 'active').order('created_at', { ascending: false }).limit(5),
    // All candidates for pipeline
    supabase.from('candidates').select('stage').eq('org_id', orgId),
  ])

  // Build pipeline data
  const pipelineCounts: Record<string, number> = {}
  for (const c of allCandidates || []) {
    pipelineCounts[c.stage] = (pipelineCounts[c.stage] || 0) + 1
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Bienvenido de nuevo, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Resumen de tu actividad de reclutamiento
        </p>
      </div>

      <DashboardStats
        totalCandidates={totalCandidates || 0}
        activeVacancies={activeVacancies || 0}
        inProcess={inProcessCandidates || 0}
        hired={hiredCandidates || 0}
        prevCandidates={prevMonthCandidates || 0}
        prevActive={prevActiveVacancies || 0}
        prevInProcess={prevInProcess || 0}
        prevHired={prevHired || 0}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <OfertasActivas ofertas={activeOffers || []} />
        <div className="space-y-6">
          <PipelineSummary counts={pipelineCounts} />
          <CandidatosRecientes candidatos={recentCandidates || []} />
        </div>
      </div>
    </div>
  )
}
