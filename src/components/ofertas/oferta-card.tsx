import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VACANCY_STATUS_LABELS } from '@/lib/constants'
import type { Vacancy } from '@/types/database'
import { MapPin, Users, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  oferta: Vacancy
}

export function OfertaCard({ oferta }: Props) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-600',
  }

  return (
    <Link href={`/ofertas/${oferta.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{oferta.title}</CardTitle>
            <Badge className={statusColors[oferta.status]} variant="secondary">
              {VACANCY_STATUS_LABELS[oferta.status]}
            </Badge>
          </div>
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
