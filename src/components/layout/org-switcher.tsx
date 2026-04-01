'use client'

import { useOrg } from '@/hooks/use-org'
import { Building2, ChevronDown } from 'lucide-react'

export function OrgSwitcher() {
  const { org, loading } = useOrg()

  if (loading) {
    return <div className="h-5 w-32 animate-pulse rounded bg-muted" />
  }

  return (
    <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
      <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <span className="max-w-[160px] truncate">
        {org?.name || 'Mi Organización'}
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
    </button>
  )
}
