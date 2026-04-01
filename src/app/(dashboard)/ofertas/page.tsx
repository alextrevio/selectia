import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { OfertaCard } from '@/components/ofertas/oferta-card'
import type { Vacancy } from '@/types/database'

export default async function OfertasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const { data: ofertas } = await supabase
    .from('vacancies')
    .select('*')
    .eq('org_id', userData?.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ofertas</h1>
          <p className="text-muted-foreground">Gestiona tus vacantes</p>
        </div>
        <Link href="/ofertas?modal=crear">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva oferta
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(ofertas as Vacancy[] || []).map((oferta) => (
          <OfertaCard key={oferta.id} oferta={oferta} />
        ))}
        {(!ofertas || ofertas.length === 0) && (
          <p className="col-span-full text-center text-muted-foreground py-12">
            No hay ofertas creadas. Crea tu primera oferta para empezar.
          </p>
        )}
      </div>
    </div>
  )
}
