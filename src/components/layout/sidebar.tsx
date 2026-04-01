'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ofertas', label: 'Ofertas', icon: Briefcase },
  { href: '/candidatos', label: 'Candidatos', icon: Users },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 px-6">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Selectia</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
