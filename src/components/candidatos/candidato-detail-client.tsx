'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StageBadge } from './stage-badge'
import { ScoreBadge } from './score-badge'
import { ChatPanel } from '@/components/conversations/chat-panel'
import { STAGE_LABELS } from '@/lib/constants'
import type {
  Candidate,
  Vacancy,
  Message,
  Conversation,
  ActivityLog,
  CandidateStage,
} from '@/types/database'
import {
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  XCircle,
  Send,
  UserPlus,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  candidato: Candidate
  vacancy: Pick<Vacancy, 'id' | 'title'> | null
  conversation: Conversation | null
  messages: Message[]
  activities: ActivityLog[]
}

export function CandidatoDetailClient({
  candidato: initialCandidato,
  vacancy,
  conversation,
  messages,
  activities,
}: Props) {
  const router = useRouter()
  const [candidato, setCandidato] = useState(initialCandidato)
  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const initials = candidato.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  const patchCandidate = async (fields: Record<string, unknown>) => {
    const res = await fetch(`/api/candidatos/${candidato.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    if (res.ok) {
      const updated = await res.json()
      setCandidato(updated)
      return true
    }
    toast.error('Error al actualizar')
    return false
  }

  const toggleStar = () => patchCandidate({ is_starred: !candidato.is_starred })

  const changeStage = async (newStage: string) => {
    const res = await fetch(`/api/candidatos/${candidato.id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCandidato(updated)
      toast.success(`Etapa cambiada a ${STAGE_LABELS[newStage as CandidateStage]}`)
    } else {
      toast.error('Error al cambiar etapa')
    }
  }

  const saveNote = async () => {
    if (!note.trim()) return
    setSavingNote(true)
    const res = await fetch(`/api/candidatos/${candidato.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    if (res.ok) {
      toast.success('Nota guardada')
      setNote('')
      router.refresh()
    } else {
      toast.error('Error al guardar nota')
    }
    setSavingNote(false)
  }

  const addTag = async () => {
    if (!tagInput.trim()) return
    const newTags = [...candidato.tags, tagInput.trim()]
    if (await patchCandidate({ tags: newTags })) {
      setTagInput('')
      toast.success('Tag agregado')
    }
  }

  const removeTag = async (tag: string) => {
    await patchCandidate({ tags: candidato.tags.filter((t) => t !== tag) })
  }

  // Score circle
  const scorePercent = candidato.score
  const scoreColor =
    scorePercent >= 70
      ? 'text-green-600 dark:text-green-400'
      : scorePercent >= 30
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-500'
  const strokeColor =
    scorePercent >= 70
      ? 'stroke-green-500'
      : scorePercent >= 30
        ? 'stroke-yellow-500'
        : 'stroke-red-500'

  const activityIcons: Record<string, typeof UserPlus> = {
    stage_changed: ArrowRight,
    note_added: Send,
    created: UserPlus,
    score_updated: Star,
    interview_scheduled: Calendar,
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* LEFT COLUMN (3/5 = 60%) */}
      <div className="lg:col-span-3 space-y-4">
        {/* Profile header */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="pt-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {candidato.full_name || 'Sin nombre'}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {candidato.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {candidato.phone}
                    </span>
                  )}
                  {candidato.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {candidato.email}
                    </span>
                  )}
                  {candidato.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {candidato.location}
                    </span>
                  )}
                </div>
                {/* Action buttons */}
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={toggleStar}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${candidato.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`}
                    />
                    {candidato.is_starred ? 'Favorito' : 'Marcar'}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Agendar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-red-600 hover:text-red-700"
                    onClick={() => changeStage('rejected')}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score card */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Circle */}
              <div className="relative h-20 w-20 shrink-0">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={`${scorePercent}, 100`}
                    className={strokeColor}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${scoreColor}`}>
                  {scorePercent}
                </span>
              </div>
              <div className="flex-1 text-sm">
                {conversation?.ai_recommendation ? (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Recomendación IA</p>
                    <p className="text-muted-foreground text-xs">{conversation.ai_recommendation}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">Sin evaluación IA disponible</p>
                )}
              </div>
            </div>
            {candidato.score_breakdown && Object.keys(candidato.score_breakdown).length > 0 && (
              <div className="mt-4 space-y-2">
                {Object.entries(candidato.score_breakdown).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium">{String(val)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(Number(val) * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {candidato.age && (
                <>
                  <span className="text-muted-foreground">Edad</span>
                  <span>{candidato.age} años</span>
                </>
              )}
              <span className="text-muted-foreground">Ubicación</span>
              <span>{candidato.location || '-'}</span>
              <span className="text-muted-foreground">Fuente</span>
              <span className="capitalize">{candidato.source}</span>
              <span className="text-muted-foreground">Oferta</span>
              <span>{vacancy?.title || '-'}</span>
            </div>
            {candidato.experience_summary && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Experiencia</p>
                <p className="text-xs text-muted-foreground">{candidato.experience_summary}</p>
              </div>
            )}
            {candidato.skills.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-2 text-gray-900 dark:text-gray-100">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {candidato.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage card */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <StageBadge stage={candidato.stage} />
              <Select value={candidato.stage} onValueChange={(v: string | null) => { if (v) changeStage(v) }}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(STAGE_LABELS) as [CandidateStage, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {candidato.stage_changed_at && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(candidato.stage_changed_at), { addSuffix: true, locale: es })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes card */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {candidato.notes && (
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans bg-gray-50 dark:bg-gray-900 rounded p-2 max-h-40 overflow-y-auto">
                {candidato.notes}
              </pre>
            )}
            <div className="flex gap-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Agregar nota..."
                rows={2}
                className="text-sm"
              />
              <Button
                onClick={saveNote}
                disabled={savingNote || !note.trim()}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags card */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {candidato.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {candidato.tags.length === 0 && (
                <span className="text-xs text-muted-foreground">Sin tags</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Nuevo tag..."
                className="flex-1 rounded-md border bg-transparent px-2.5 py-1.5 text-sm"
              />
              <Button variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN (2/5 = 40%) */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="conversacion">
          <TabsList className="w-full">
            <TabsTrigger value="conversacion" className="flex-1">Conversación</TabsTrigger>
            <TabsTrigger value="actividad" className="flex-1">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="conversacion" className="mt-3">
            <ChatPanel
              conversationId={conversation?.id}
              candidateId={candidato.id}
              initialMessages={messages}
              conversationStatus={conversation?.status}
            />
          </TabsContent>

          <TabsContent value="actividad" className="mt-3">
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="pt-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Sin actividad registrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((a) => {
                      const Icon = activityIcons[a.action] || ArrowRight
                      return (
                        <div key={a.id} className="flex gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <Icon className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              {a.action === 'stage_changed' && (
                                <>Etapa cambió a <span className="font-medium">{STAGE_LABELS[(a.details as Record<string, string>)?.new_stage as CandidateStage] || (a.details as Record<string, string>)?.new_stage}</span></>
                              )}
                              {a.action === 'note_added' && 'Nota agregada'}
                              {a.action === 'created' && 'Candidato creado'}
                              {a.action === 'score_updated' && 'Score actualizado'}
                              {a.action === 'interview_scheduled' && 'Entrevista agendada'}
                              {!['stage_changed', 'note_added', 'created', 'score_updated', 'interview_scheduled'].includes(a.action) && a.action}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {format(new Date(a.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
