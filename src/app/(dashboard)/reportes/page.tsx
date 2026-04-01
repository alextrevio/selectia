import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/reportes/stats-cards'
import { PipelineChart } from '@/components/reportes/pipeline-chart'
import { PIPELINE_STAGES } from '@/lib/constants'
import type { CandidateStage } from '@/types/database'

export default async function ReportesPage() {
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
    { count: totalCandidates },
    { count: totalVacancies },
    { count: hiredCount },
    { data: candidates },
  ] = await Promise.all([
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('vacancies').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('stage', 'hired'),
    supabase.from('candidates').select('stage').eq('org_id', orgId),
  ])

  const pipelineData = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = (candidates || []).filter((c: { stage: string }) => c.stage === stage).length
    return acc
  }, {} as Record<CandidateStage, number>)

  const stats = [
    { label: 'Total candidatos', value: totalCandidates || 0 },
    { label: 'Total ofertas', value: totalVacancies || 0 },
    { label: 'Contratados', value: hiredCount || 0 },
    { label: 'Tasa de conversión', value: totalCandidates ? `${Math.round(((hiredCount || 0) / totalCandidates) * 100)}%` : '0%' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">Métricas de tu proceso de reclutamiento</p>
      </div>
      <StatsCards stats={stats} />
      <PipelineChart data={pipelineData} />
    </div>
  )
}
