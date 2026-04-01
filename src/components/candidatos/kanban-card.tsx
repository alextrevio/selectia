import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import type { Candidate } from '@/types/database'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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

  const initials = candidate.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  const score = candidate.score
  const scoreColor =
    score >= 70
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : score >= 30
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'

  const timeInStage = candidate.stage_changed_at
    ? formatDistanceToNow(new Date(candidate.stage_changed_at), { locale: es })
    : null

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/candidatos/${candidate.id}`}>
        <Card className="cursor-pointer border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <CardContent className="p-2.5">
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  {candidate.is_starred && (
                    <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                  )}
                  <p className="text-sm font-medium truncate">{candidate.full_name || 'Sin nombre'}</p>
                </div>
                {candidate.notes && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    {candidate.notes.split('\n').pop()?.replace(/\[.*?\]\s?/, '').slice(0, 60)}
                  </p>
                )}
              </div>
              <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold', scoreColor)}>
                {score}
              </span>
            </div>
            {timeInStage && (
              <p className="mt-1.5 text-[10px] text-muted-foreground pl-9">
                {timeInStage} en esta etapa
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
