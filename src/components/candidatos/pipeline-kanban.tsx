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
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Candidate, CandidateStage } from '@/types/database'
import { toast } from 'sonner'

interface Props {
  vacancyId: string
  initialCandidates: Candidate[]
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] rounded-md border border-dashed p-2 transition-colors ${isOver ? 'border-primary bg-primary/5' : 'border-transparent'}`}
    >
      {children}
    </div>
  )
}

export function PipelineKanban({ vacancyId, initialCandidates }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [activeId, setActiveId] = useState<string | null>(null)

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

    if (!PIPELINE_STAGES.includes(newStage)) return

    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidate || candidate.stage === newStage) return

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
        prev.map((c) => (c.id === candidateId ? { ...c, stage: candidate.stage } : c))
      )
      toast.error('Error al mover candidato')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage)
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <span className={`rounded px-2 py-1 text-xs font-medium ${STAGE_COLORS[stage]}`}>
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-xs text-muted-foreground">{stageCandidates.length}</span>
              </div>
              <ScrollArea className="h-[calc(100vh-350px)]">
                <DroppableColumn id={stage}>
                  <SortableContext
                    items={stageCandidates.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
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
