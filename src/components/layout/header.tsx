'use client'

import { useUser } from '@/hooks/use-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OrgSwitcher } from './org-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user } = useUser()

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <OrgSwitcher />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="flex items-center gap-2" />}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.full_name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{user?.email}</DropdownMenuItem>
            <DropdownMenuItem>Perfil</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
