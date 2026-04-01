'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type TableName = 'candidates' | 'conversations' | 'messages' | 'vacancies' | 'interviews'

export function useRealtime<T extends Record<string, unknown>>(
  table: TableName,
  filter: string | undefined,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, table, filter, callback])
}
