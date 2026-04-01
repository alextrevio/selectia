import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StageBadge } from '@/components/candidatos/stage-badge'
import type { CandidateWithVacancy } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  candidatos: CandidateWithVacancy[]
}

export function CandidatosRecientes({ candidatos }: Props) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Candidatos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {candidatos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay candidatos aún</p>
        ) : (
          <div className="space-y-3">
            {candidatos.map((c) => {
              const initials = c.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '??'
              return (
                <Link
                  key={c.id}
                  href={`/candidatos/${c.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.full_name || 'Sin nombre'}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.vacancy?.title || 'Sin oferta'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StageBadge stage={c.stage} />
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
