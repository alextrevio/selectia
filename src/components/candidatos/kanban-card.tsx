import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreBadge } from './score-badge'
import type { Candidate } from '@/types/database'
import { Star, Phone } from 'lucide-react'
import Link from 'next/link'

interface Props {
  candidate: Candidate
}

export function KanbanCard({ candidate }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/candidatos/${candidate.id}`}>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{candidate.full_name || 'Sin nombre'}</p>
                {candidate.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" /> {candidate.phone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {candidate.is_starred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                <ScoreBadge score={candidate.score} />
              </div>
            </div>
            {candidate.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {candidate.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{tag}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
