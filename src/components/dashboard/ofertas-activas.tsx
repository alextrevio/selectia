import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Vacancy } from '@/types/database'

interface Props {
  ofertas: Vacancy[]
}

export function OfertasActivas({ ofertas }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ofertas activas</CardTitle>
      </CardHeader>
      <CardContent>
        {ofertas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay ofertas activas</p>
        ) : (
          <div className="space-y-3">
            {ofertas.map((oferta) => (
              <Link
                key={oferta.id}
                href={`/ofertas/${oferta.id}`}
                className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{oferta.title}</p>
                  <p className="text-sm text-muted-foreground">{oferta.department || 'Sin departamento'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{oferta.total_candidates} candidatos</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
