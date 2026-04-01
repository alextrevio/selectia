import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CandidatoRow } from '@/components/candidatos/candidato-row'
import type { CandidateWithVacancy } from '@/types/database'

export default async function CandidatosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const { data: candidatos } = await supabase
    .from('candidates')
    .select('*, vacancy:vacancies(id, title)')
    .eq('org_id', userData?.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Candidatos</h1>
        <p className="text-muted-foreground">Todos los candidatos de tu organización</p>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Oferta</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(candidatos as CandidateWithVacancy[] || []).map((c) => (
              <CandidatoRow key={c.id} candidato={c} />
            ))}
          </TableBody>
        </Table>
        {(!candidatos || candidatos.length === 0) && (
          <p className="py-12 text-center text-muted-foreground">No hay candidatos aún</p>
        )}
      </div>
    </div>
  )
}
