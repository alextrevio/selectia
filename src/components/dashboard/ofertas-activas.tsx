import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Vacancy } from '@/types/database'
import { Briefcase } from 'lucide-react'

interface Props {
  ofertas: Vacancy[]
}

export function OfertasActivas({ ofertas }: Props) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Ofertas Activas</CardTitle>
      </CardHeader>
      <CardContent>
        {ofertas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <Briefcase className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sin ofertas activas</p>
              <p className="text-xs text-muted-foreground mt-1">Crea una oferta para empezar</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {ofertas.map((oferta) => (
              <Link
                key={oferta.id}
                href={`/ofertas/${oferta.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{oferta.title}</p>
                  <p className="text-xs text-muted-foreground">{oferta.department || 'Sin departamento'} · {oferta.location || 'Sin ubicación'}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 ml-2 text-xs">
                  {oferta.total_candidates} candidatos
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
