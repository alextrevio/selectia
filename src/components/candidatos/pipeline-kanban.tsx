'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { KanbanCard } from './kanban-card'
import { STAGE_LABELS } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Candidate, CandidateStage } from '@/types/database'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  vacancyId: string
  initialCandidates: Candidate[]
}

const COLUMN_CONFIG: {
  stage: CandidateStage
  color: string
  dotColor: string
  bg: string
}[] = [
  { stage: 'new', color: 'text-gray-700 dark:text-gray-300', dotColor: 'bg-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/50' },
  { stage: 'screening', color: 'text-yellow-700 dark:text-yellow-300', dotColor: 'bg-yellow-400', bg: 'bg-yellow-50/50 dark:bg-yellow-950/20' },
  { stage: 'qualified', color: 'text-emerald-700 dark:text-emerald-300', dotColor: 'bg-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
  { stage: 'interview', color: 'text-purple-700 dark:text-purple-300', dotColor: 'bg-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-950/20' },
  { stage: 'offer', color: 'text-orange-700 dark:text-orange-300', dotColor: 'bg-orange-400', bg: 'bg-orange-50/50 dark:bg-orange-950/20' },
  { stage: 'hired', color: 'text-green-800 dark:text-green-200', dotColor: 'bg-green-600', bg: 'bg-green-50/50 dark:bg-green-950/20' },
  { stage: 'rejected', color: 'text-red-700 dark:text-red-300', dotColor: 'bg-red-400', bg: 'bg-red-50/50 dark:bg-red-950/20' },
]

function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[120px] rounded-md border border-dashed p-1.5 transition-colors',
        isOver ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20' : 'border-transparent',
        className
      )}
    >
      {children}
    </div>
  )
}

export function PipelineKanban({ vacancyId, initialCandidates }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [rejectedOpen, setRejectedOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const getCandidatesByStage = useCallback(
    (stage: CandidateStage) => candidates.filter((c) => c.stage === stage),
    [candidates]
  )

  const activeCandidate = activeId ? candidates.find((c) => c.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const candidateId = active.id as string
    const newStage = over.id as CandidateStage

    const allStages: CandidateStage[] = ['new', 'screening', 'qualified', 'interview', 'offer', 'hired', 'rejected']
    if (!allStages.includes(newStage)) return

    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidate || candidate.stage === newStage) return

    // Optimistic update
    const oldStage = candidate.stage
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    )

    const res = await fetch(`/api/candidatos/${candidateId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })

    if (!res.ok) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: oldStage } : c))
      )
      toast.error('Error al mover candidato')
    } else {
      toast.success(`${candidate.full_name || 'Candidato'} movido a ${STAGE_LABELS[newStage]}`)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMN_CONFIG.map((col) => {
          const stageCandidates = getCandidatesByStage(col.stage)
          const isRejected = col.stage === 'rejected'

          if (isRejected) {
            return (
              <div key={col.stage} className="w-56 shrink-0">
                <button
                  onClick={() => setRejectedOpen(!rejectedOpen)}
                  className="mb-2 flex w-full items-center justify-between rounded-md px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                    <span className={`text-xs font-semibold ${col.color}`}>
                      {STAGE_LABELS[col.stage]}
                    </span>
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {stageCandidates.length}
                    </span>
                  </div>
                  {rejectedOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>
                {rejectedOpen && (
                  <ScrollArea className="h-[calc(100vh-380px)]">
                    <DroppableColumn id={col.stage} className={col.bg}>
                      <SortableContext
                        items={stageCandidates.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1.5">
                          {stageCandidates.map((candidate) => (
                            <KanbanCard key={candidate.id} candidate={candidate} />
                          ))}
                        </div>
                      </SortableContext>
                    </DroppableColumn>
                  </ScrollArea>
                )}
              </div>
            )
          }

          return (
            <div key={col.stage} className="w-56 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                  <span className={`text-xs font-semibold ${col.color}`}>
                    {STAGE_LABELS[col.stage]}
                  </span>
                </div>
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {stageCandidates.length}
                </span>
              </div>
              <ScrollArea className="h-[calc(100vh-380px)]">
                <DroppableColumn id={col.stage} className={col.bg}>
                  <SortableContext
                    items={stageCandidates.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1.5">
                      {stageCandidates.map((candidate) => (
                        <KanbanCard key={candidate.id} candidate={candidate} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </ScrollArea>
            </div>
          )
        })}
      </div>
      <DragOverlay>
        {activeCandidate ? <KanbanCard candidate={activeCandidate} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
