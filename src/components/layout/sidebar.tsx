'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/hooks/use-user'

const mainNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ofertas', label: 'Ofertas', icon: Briefcase },
  { href: '/candidatos', label: 'Candidatos', icon: Users },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
]

const bottomNav = [
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const renderLink = (item: (typeof mainNav)[0]) => {
    const active = isActive(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'relative flex items-center gap-3 rounded-r-md px-4 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        )}
      >
        {active && (
          <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-blue-600 dark:bg-blue-400" />
        )}
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {item.label}
      </Link>
    )
  }

  return (
    <aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* User info */}
      <div className="flex items-center gap-3 px-5 py-4">
        {loading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {user?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '??'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {user?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Administrador
              </p>
            </div>
          </>
        )}
      </div>

      <Separator className="bg-[#E5E7EB] dark:bg-gray-800" />

      {/* Main nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-0.5 pr-2">
          {mainNav.map(renderLink)}
        </nav>
      </ScrollArea>

      <Separator className="bg-[#E5E7EB] dark:bg-gray-800" />

      {/* Bottom nav */}
      <div className="py-2 pr-2">
        {bottomNav.map(renderLink)}
        <button
          onClick={handleLogout}
          className="relative flex w-full items-center gap-3 rounded-r-md px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

/** Mobile bottom navigation bar */
export function MobileBottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const items = [
    { href: '/', label: 'Inicio', icon: LayoutDashboard },
    { href: '/ofertas', label: 'Ofertas', icon: Briefcase },
    { href: '/candidatos', label: 'Candidatos', icon: Users },
    { href: '/reportes', label: 'Reportes', icon: BarChart3 },
    { href: '/configuracion', label: 'Más', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-[#E5E7EB] bg-white dark:border-gray-800 dark:bg-gray-950">
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              active
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
