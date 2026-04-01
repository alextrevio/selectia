'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StageBadge } from './stage-badge'
import { ScoreBadge } from './score-badge'
import { AddCandidatoModal } from './add-candidato-modal'
import { Badge } from '@/components/ui/badge'
import { STAGE_LABELS } from '@/lib/constants'
import type { CandidateWithVacancy, Vacancy, CandidateStage } from '@/types/database'
import { RefreshCw, Download, Search, Star, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

const PAGE_SIZE = 20

interface Props {
  candidatos: CandidateWithVacancy[]
  vacancies: Pick<Vacancy, 'id' | 'title'>[]
}

export function CandidatosListClient({ candidatos, vacancies }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const activeCandidatos = candidatos.filter((c) => c.stage !== 'rejected')
  const archivedCandidatos = candidatos.filter((c) => c.stage === 'rejected')

  const filterList = (list: CandidateWithVacancy[]) => {
    return list.filter((c) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.skills?.some((s) => s.toLowerCase().includes(q))
      const matchesStage = stageFilter === 'all' || c.stage === stageFilter
      return matchesSearch && matchesStage
    })
  }

  const getInitials = (name: string | null) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??'

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderTable = (list: CandidateWithVacancy[]) => {
    const filtered = filterList(list)
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Users className="h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No hay candidatos</p>
          <p className="text-xs text-muted-foreground">Agrega candidatos manualmente o espera que apliquen por WhatsApp</p>
        </div>
      )
    }

    return (
      <>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox />
                </TableHead>
                <TableHead>Candidato</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Oferta</TableHead>
                <TableHead>Skills</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => router.push(`/candidatos/${c.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggleSelected(c.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {getInitials(c.full_name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          {c.is_starred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                          <span className="text-sm font-medium">{c.full_name || 'Sin nombre'}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          hace {formatDistanceToNow(new Date(c.created_at), { locale: es })}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {c.email && <p className="truncate max-w-[160px]">{c.email}</p>}
                      {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                      {!c.email && !c.phone && <span className="text-muted-foreground">-</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.location || '-'}
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={c.stage} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.vacancy?.title || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {c.skills?.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {s}
                        </Badge>
                      ))}
                      {(c.skills?.length || 0) > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Candidatos</h1>
          <p className="text-muted-foreground">{candidatos.length} candidatos en total</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.refresh()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refrescar
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
          <AddCandidatoModal vacancies={vacancies} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activos" onValueChange={() => { setPage(0); setSearch(''); setStageFilter('all') }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="activos">
              Activos
              {activeCandidatos.length > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {activeCandidatos.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archivados">
              Archivados
              {archivedCandidatos.length > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {archivedCandidatos.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email, skills..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="h-9 w-[260px] pl-8 text-sm"
              />
            </div>
            <Select value={stageFilter} onValueChange={(v: string | null) => { setStageFilter(v ?? 'all'); setPage(0) }}>
              <SelectTrigger className="h-9 w-[160px] text-sm">
                <SelectValue placeholder="Todas las etapas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                {(Object.entries(STAGE_LABELS) as [CandidateStage, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="activos" className="mt-4">
          {renderTable(activeCandidatos)}
        </TabsContent>
        <TabsContent value="archivados" className="mt-4">
          {renderTable(archivedCandidatos)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
