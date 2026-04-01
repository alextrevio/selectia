'use client'

import { useEffect, useCallback, useState } from 'react'
import { useUser } from '@/hooks/use-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Building2, ChevronDown, Plus, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ofertas', label: 'Ofertas', icon: Briefcase },
  { href: '/candidatos', label: 'Candidatos', icon: Users },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Header() {
  const { user, org, loading } = useUser()
  const [searchOpen, setSearchOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const initials =
    user?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??'

  // Cmd+K shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    },
    []
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-4 dark:border-gray-800 dark:bg-gray-950 md:px-6">
      {/* Left: Hamburger (mobile) + Org switcher */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SheetHeader className="px-5 pt-5 pb-3">
              <SheetTitle>
                <span className="text-lg font-bold tracking-tight">
                  select<span className="text-blue-600">.ia</span>
                </span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-0.5 px-2">
              {navItems.map((item) => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Cerrar sesión
              </button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Org switcher */}
        {loading ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
            <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="hidden sm:inline max-w-[160px] truncate">
              {org?.name || 'Mi Organización'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar... (⌘K)"
            className="pl-9 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 h-9"
            onFocus={() => setSearchOpen(true)}
            readOnly
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* + Nueva Oferta */}
        <Link href="/ofertas?modal=crear">
          <Button className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm gap-1.5">
            <Plus className="h-4 w-4" />
            Nueva Oferta
          </Button>
        </Link>
        <Link href="/ofertas?modal=crear" className="sm:hidden">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 w-9" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>

        {/* Admin link */}
        <span className="hidden lg:inline text-sm text-gray-500 dark:text-gray-400">
          Admin
        </span>

        {/* Bell */}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 dark:text-gray-400">
          <Bell className="h-[18px] w-[18px]" />
        </Button>

        {/* Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<button className="flex items-center outline-none" />}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="font-medium">{user?.full_name}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/configuracion" className="w-full">
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
