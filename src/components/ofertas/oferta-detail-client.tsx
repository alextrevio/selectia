'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PipelineKanban } from '@/components/candidatos/pipeline-kanban'
import { KillerQuestionsEditor } from '@/components/ofertas/killer-questions-editor'
import { StageBadge } from '@/components/candidatos/stage-badge'
import { ScoreBadge } from '@/components/candidatos/score-badge'
import { VACANCY_STATUS_LABELS, MODALITY_OPTIONS } from '@/lib/constants'
import type { Vacancy, Candidate, KillerQuestion } from '@/types/database'
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Pencil,
  Pause,
  XCircle,
  MessageCircle,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

interface Props {
  vacancy: Vacancy
  candidatos: Candidate[]
  questions: KillerQuestion[]
}

export function OfertaDetailClient({ vacancy, candidatos, questions }: Props) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  const modalityLabel =
    MODALITY_OPTIONS.find((m) => m.value === vacancy.modality)?.label || vacancy.modality

  const wavNumber = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_ZAVU_WHATSAPP_NUMBER || '')
    : ''

  const whatsappLink = wavNumber
    ? `https://wa.me/${wavNumber}?text=${encodeURIComponent(vacancy.vacancy_code)}`
    : null

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    const res = await fetch(`/api/ofertas/${vacancy.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      toast.success(`Oferta ${newStatus === 'paused' ? 'pausada' : newStatus === 'closed' ? 'cerrada' : 'actualizada'}`)
      router.refresh()
    } else {
      toast.error('Error al actualizar')
    }
    setUpdating(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(vacancy.vacancy_code)
    toast.success('Código copiado')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {vacancy.title}
            </h1>
            <Badge className={statusColors[vacancy.status]} variant="secondary">
              {VACANCY_STATUS_LABELS[vacancy.status]}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {vacancy.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {vacancy.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {modalityLabel}
            </span>
            {vacancy.salary_min != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                ${Number(vacancy.salary_min).toLocaleString()} - ${Number(vacancy.salary_max).toLocaleString()} MXN
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {vacancy.total_candidates} candidatos
            </span>
          </div>

          {/* WhatsApp link + vacancy code */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1.5 text-sm dark:bg-gray-800">
              <MessageCircle className="h-3.5 w-3.5 text-green-600" />
              <span className="font-mono text-xs font-semibold">{vacancy.vacancy_code}</span>
              <button onClick={copyCode} className="text-gray-400 hover:text-gray-600 ml-1">
                <Copy className="h-3 w-3" />
              </button>
            </div>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-green-600 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir en WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" disabled={updating}>
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          {vacancy.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={updating}
              onClick={() => updateStatus('paused')}
            >
              <Pause className="h-3.5 w-3.5" />
              Pausar
            </Button>
          )}
          {vacancy.status !== 'closed' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 hover:text-red-700"
              disabled={updating}
              onClick={() => updateStatus('closed')}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cerrar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="candidatos">
            Candidatos
            {candidatos.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold dark:bg-gray-800">
                {candidatos.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        {/* Pipeline tab */}
        <TabsContent value="pipeline" className="mt-4">
          <PipelineKanban
            vacancyId={vacancy.id}
            initialCandidates={candidatos}
          />
        </TabsContent>

        {/* Candidatos table tab */}
        <TabsContent value="candidatos" className="mt-4">
          {candidatos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-muted-foreground">
                No hay candidatos para esta oferta
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidatos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link
                          href={`/candidatos/${c.id}`}
                          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {c.full_name || 'Sin nombre'}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{c.phone || '-'}</TableCell>
                      <TableCell>
                        <StageBadge stage={c.stage} />
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={c.score} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.source}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Configuración tab - edit questions + agent */}
        <TabsContent value="configuracion" className="mt-4 space-y-6">
          {/* Vacancy details */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {vacancy.description || 'Sin descripción'}
                </p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Configuración del Agente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tono</span>
                  <span className="font-medium capitalize">{vacancy.agent_tone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score mín. para pasar</span>
                  <span className="font-medium">{vacancy.auto_reject_below}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score para escalar</span>
                  <span className="font-medium">{vacancy.escalate_to_human_above}</span>
                </div>
                {vacancy.agent_greeting && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Mensaje de bienvenida:</p>
                    <p className="text-xs italic">{vacancy.agent_greeting}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Killer questions editor */}
          <KillerQuestionsEditor
            vacancyId={vacancy.id}
            initialQuestions={questions}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
