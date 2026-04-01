import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VACANCY_STATUS_LABELS } from '@/lib/constants'
import type { Vacancy } from '@/types/database'
import { MapPin, Users, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

interface Props {
  oferta: Vacancy
  variant?: 'grid' | 'list'
}

export function OfertaCard({ oferta, variant = 'grid' }: Props) {
  if (variant === 'list') {
    return (
      <Link href={`/ofertas/${oferta.id}`}>
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900">
          <div className="flex items-center gap-4 min-w-0">
            <div className="min-w-0">
              <p className="font-medium truncate">{oferta.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {oferta.department && <span>{oferta.department}</span>}
                {oferta.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {oferta.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(oferta.created_at), { addSuffix: true, locale: es })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {oferta.total_candidates}
            </span>
            <Badge className={statusColors[oferta.status]} variant="secondary">
              {VACANCY_STATUS_LABELS[oferta.status]}
            </Badge>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/ofertas/${oferta.id}`}>
      <Card className="border border-gray-200 transition-shadow hover:shadow-md dark:border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">{oferta.title}</CardTitle>
            <Badge className={cn(statusColors[oferta.status], 'shrink-0')} variant="secondary">
              {VACANCY_STATUS_LABELS[oferta.status]}
            </Badge>
          </div>
          {oferta.department && (
            <p className="text-xs text-muted-foreground">{oferta.department}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {oferta.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {oferta.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {oferta.total_candidates} candidatos
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />{' '}
              {formatDistanceToNow(new Date(oferta.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
