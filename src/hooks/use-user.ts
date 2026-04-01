'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setLoading(false); return }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser(data)
      setLoading(false)
    }
    fetchUser()
  }, [supabase])

  return { user, loading }
}
