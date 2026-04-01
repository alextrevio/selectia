import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OfertaDetailClient } from '@/components/ofertas/oferta-detail-client'
import type { Vacancy, Candidate, KillerQuestion } from '@/types/database'

export default async function OfertaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  return (
    <OfertaDetailClient
      vacancy={oferta as Vacancy}
      candidatos={(candidatos as Candidate[]) || []}
      questions={(questions as KillerQuestion[]) || []}
    />
  )
}
