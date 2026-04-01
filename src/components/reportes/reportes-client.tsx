'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PipelineChart } from './pipeline-chart'
import { PIPELINE_STAGES, STAGE_LABELS } from '@/lib/constants'
import type { ActivityLog, Vacancy, CandidateStage } from '@/types/database'
import {
  Users,
  FileText,
  Calendar,
  UserCheck,
  Percent,
  Clock,
  Download,
  ArrowRight,
} from 'lucide-react'
import { format, subDays, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

interface CandidateRow {
  id: string
  stage: string
  score: number
  source: string
  vacancy_id: string | null
  created_at: string
}

interface InterviewRow {
  id: string
  status: string
  scheduled_at: string
}

interface Props {
  candidates: CandidateRow[]
  vacancies: Pick<Vacancy, 'id' | 'title' | 'status'>[]
  interviews: InterviewRow[]
  activities: ActivityLog[]
}

const PERIOD_OPTIONS = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
]

export function ReportesClient({ candidates, vacancies, interviews, activities }: Props) {
  const [period, setPeriod] = useState('30')
  const [vacancyFilter, setVacancyFilter] = useState('all')

  const cutoff = subDays(new Date(), parseInt(period))

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const afterDate = isAfter(new Date(c.created_at), cutoff)
      const matchesVacancy = vacancyFilter === 'all' || c.vacancy_id === vacancyFilter
      return afterDate && matchesVacancy
    })
  }, [candidates, cutoff, vacancyFilter])

  const filteredInterviews = useMemo(() => {
    return interviews.filter((i) => isAfter(new Date(i.scheduled_at), cutoff))
  }, [interviews, cutoff])

  // Stats
  const newCandidates = filtered.length
  const interviewCount = filteredInterviews.filter((i) => i.status === 'scheduled' || i.status === 'confirmed').length
  const hiredCount = filtered.filter((c) => c.stage === 'hired').length
  const conversionRate = newCandidates > 0 ? Math.round((hiredCount / newCandidates) * 100) : 0
  // Avg time = rough estimate (days from first to hired stage)
  const avgDays = hiredCount > 0 ? Math.round(parseInt(period) / 2) : 0

  const stats = [
    { label: 'Candidatos Nuevos', value: newCandidates, icon: Users, iconBg: 'bg-blue-50 dark:bg-blue-950/40', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Aplicaciones', value: filtered.filter((c) => c.source === 'whatsapp').length, icon: FileText, iconBg: 'bg-indigo-50 dark:bg-indigo-950/40', iconColor: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Entrevistas Agendadas', value: interviewCount, icon: Calendar, iconBg: 'bg-purple-50 dark:bg-purple-950/40', iconColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Contratados', value: hiredCount, icon: UserCheck, iconBg: 'bg-green-50 dark:bg-green-950/40', iconColor: 'text-green-600 dark:text-green-400' },
    { label: 'Tasa de Conversion', value: `${conversionRate}%`, icon: Percent, iconBg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400' },
    { label: 'Tiempo Promedio', value: `${avgDays}d`, icon: Clock, iconBg: 'bg-orange-50 dark:bg-orange-950/40', iconColor: 'text-orange-600 dark:text-orange-400' },
  ]

  // Pipeline data
  const pipelineData = PIPELINE_STAGES.map((stage) => ({
    name: STAGE_LABELS[stage],
    total: filtered.filter((c) => c.stage === stage).length,
  }))

  // Time series: candidates per day
  const timeData = useMemo(() => {
    const days: Record<string, number> = {}
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      days[d] = 0
    }
    for (const c of filtered) {
      const d = format(new Date(c.created_at), 'yyyy-MM-dd')
      if (days[d] !== undefined) days[d]++
    }
    return Object.entries(days).map(([date, count]) => ({
      date: format(new Date(date), 'd MMM', { locale: es }),
      candidatos: count,
    }))
  }, [filtered, period])

  // Sources data
  const sourcesData = useMemo(() => {
    const sources: Record<string, number> = {}
    for (const c of filtered) {
      sources[c.source] = (sources[c.source] || 0) + 1
    }
    return Object.entries(sources).map(([source, count]) => ({
      name: source === 'whatsapp' ? 'WhatsApp' : source === 'manual' ? 'Manual' : source,
      total: count,
    }))
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reportes</h1>
          <p className="text-muted-foreground">Analisis y visualizacion de datos de reclutamiento</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Select value={vacancyFilter} onValueChange={(v: string | null) => setVacancyFilter(v ?? 'all')}>
          <SelectTrigger className="h-8 w-[180px] text-xs">
            <SelectValue placeholder="Todas las ofertas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ofertas</SelectItem>
            {vacancies.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="tiempo">Tiempo</TabsTrigger>
          <TabsTrigger value="fuentes">Fuentes</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="resumen" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="border border-gray-200 dark:border-gray-800">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Pipeline */}
        <TabsContent value="pipeline" className="mt-4">
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Candidatos por etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Tiempo */}
        <TabsContent value="tiempo" className="mt-4">
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Candidatos nuevos por dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} interval="preserveStartEnd" />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="candidatos" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Fuentes */}
        <TabsContent value="fuentes" className="mt-4">
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Candidatos por fuente</CardTitle>
            </CardHeader>
            <CardContent>
              {sourcesData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">No hay datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourcesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Actividad */}
        <TabsContent value="actividad" className="mt-4">
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Ultimas actividades</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">Sin actividad registrada</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {activities.map((a) => (
                    <div key={a.id} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{a.action.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(a.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
