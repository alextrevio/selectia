'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OfertaCard } from './oferta-card'
import { CrearOfertaModal } from './crear-oferta-modal'
import { Plus, Briefcase, LayoutGrid, List, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTMENT_OPTIONS, MODALITY_OPTIONS } from '@/lib/constants'
import type { Vacancy } from '@/types/database'

interface Props {
  ofertas: Vacancy[]
}

export function OfertasListClient({ ofertas }: Props) {
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [modalityFilter, setModalityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const activeOfertas = ofertas.filter((o) => o.status === 'active' || o.status === 'draft' || o.status === 'paused')
  const archivedOfertas = ofertas.filter((o) => o.status === 'archived' || o.status === 'closed')

  const filterOfertas = (list: Vacancy[]) => {
    return list.filter((o) => {
      const matchesSearch =
        !search ||
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.department?.toLowerCase().includes(search.toLowerCase())
      const matchesDept = departmentFilter === 'all' || o.department === departmentFilter
      const matchesMod = modalityFilter === 'all' || o.modality === modalityFilter
      return matchesSearch && matchesDept && matchesMod
    })
  }

  const filteredActive = filterOfertas(activeOfertas)
  const filteredArchived = filterOfertas(archivedOfertas)

  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center gap-4 py-16 text-center">
      <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <Briefcase className="h-8 w-8 text-gray-400" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">No hay ofertas</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea tu primera oferta para empezar a recibir candidatos
        </p>
      </div>
      <CrearOfertaModal />
    </div>
  )

  const renderList = (list: Vacancy[]) => {
    if (list.length === 0) return renderEmptyState()

    if (viewMode === 'list') {
      return (
        <div className="space-y-2">
          {list.map((oferta) => (
            <OfertaCard key={oferta.id} oferta={oferta} variant="list" />
          ))}
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((oferta) => (
          <OfertaCard key={oferta.id} oferta={oferta} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ofertas</h1>
          <p className="text-muted-foreground">
            Gestiona tus ofertas de empleo y procesos de selección
          </p>
        </div>
        <CrearOfertaModal />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activas">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="activas">
              Activas {activeOfertas.length > 0 && <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">{activeOfertas.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="archivadas">
              Archivadas {archivedOfertas.length > 0 && <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">{archivedOfertas.length}</span>}
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-[180px] pl-8 text-sm"
              />
            </div>
            <Select value={departmentFilter} onValueChange={(v: string | null) => setDepartmentFilter(v ?? 'all')}>
              <SelectTrigger className="h-9 w-[140px] text-sm">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={modalityFilter} onValueChange={(v: string | null) => setModalityFilter(v ?? 'all')}>
              <SelectTrigger className="h-9 w-[130px] text-sm">
                <SelectValue placeholder="Modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {MODALITY_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="hidden sm:flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="activas" className="mt-4">
          {renderList(filteredActive)}
        </TabsContent>
        <TabsContent value="archivadas" className="mt-4">
          {renderList(filteredArchived)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
