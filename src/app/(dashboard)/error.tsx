'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <h2 className="text-xl font-semibold">Error al cargar</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message || 'Ocurrió un error al cargar esta página.'}
      </p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  )
}
