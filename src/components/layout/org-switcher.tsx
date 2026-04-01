'use client'

import { useOrg } from '@/hooks/use-org'
import { Building2 } from 'lucide-react'

export function OrgSwitcher() {
  const { org, loading } = useOrg()

  if (loading) return <div className="h-6 w-32 animate-pulse rounded bg-muted" />

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium">{org?.name || 'Sin organización'}</span>
    </div>
  )
}
