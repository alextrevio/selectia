import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/constants'
import type { CandidateWithVacancy } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  candidatos: CandidateWithVacancy[]
}

export function CandidatosRecientes({ candidatos }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Candidatos recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {candidatos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay candidatos aún</p>
        ) : (
          <div className="space-y-3">
            {candidatos.map((c) => (
              <Link
                key={c.id}
                href={`/candidatos/${c.id}`}
                className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{c.full_name || 'Sin nombre'}</p>
                  <p className="text-sm text-muted-foreground">{c.vacancy?.title || 'Sin oferta'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STAGE_COLORS[c.stage]} variant="secondary">
                    {STAGE_LABELS[c.stage]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
