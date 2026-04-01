import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PipelineKanban } from '@/components/candidatos/pipeline-kanban'
import { KillerQuestionsEditor } from '@/components/ofertas/killer-questions-editor'
import { VACANCY_STATUS_LABELS } from '@/lib/constants'
import type { Vacancy, Candidate, KillerQuestion } from '@/types/database'
import { MapPin, Clock, DollarSign, Users } from 'lucide-react'

export default async function OfertaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: oferta } = await supabase
    .from('vacancies')
    .select('*')
    .eq('id', id)
    .single()

  if (!oferta) notFound()

  const [{ data: candidatos }, { data: questions }] = await Promise.all([
    supabase
      .from('candidates')
      .select('*')
      .eq('vacancy_id', id)
      .order('score', { ascending: false }),
    supabase
      .from('killer_questions')
      .select('*')
      .eq('vacancy_id', id)
      .order('sort_order'),
  ])

  const vacancy = oferta as Vacancy

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{vacancy.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            {vacancy.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {vacancy.location}
              </span>
            )}
            {vacancy.modality && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {vacancy.modality}
              </span>
            )}
            {vacancy.salary_min && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" /> ${vacancy.salary_min?.toLocaleString()} - ${vacancy.salary_max?.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {vacancy.total_candidates} candidatos
            </span>
          </div>
        </div>
        <Badge variant="secondary">{VACANCY_STATUS_LABELS[vacancy.status]}</Badge>
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="preguntas">Killer Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          <PipelineKanban vacancyId={id} initialCandidates={(candidatos as Candidate[]) || []} />
        </TabsContent>

        <TabsContent value="detalles" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{vacancy.description || 'Sin descripción'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{vacancy.requirements || 'Sin requisitos'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preguntas" className="mt-4">
          <KillerQuestionsEditor
            vacancyId={id}
            initialQuestions={(questions as KillerQuestion[]) || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
