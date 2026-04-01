'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor, MessageSquare, Phone, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Vacancy } from '@/types/database'

export default function ConfiguracionPage() {
  const { user, org } = useUser()
  const { theme, setTheme } = useTheme()
  const [activeVacancies, setActiveVacancies] = useState<Pick<Vacancy, 'id' | 'title' | 'vacancy_code'>[]>([])
  const [copied, setCopied] = useState('')
  const supabase = createClient()

  const whatsappNumber = process.env.NEXT_PUBLIC_ZAVU_WHATSAPP_NUMBER || '—'

  useEffect(() => {
    async function loadVacancies() {
      if (!org?.id) return
      const { data } = await supabase
        .from('vacancies')
        .select('id, title, vacancy_code')
        .eq('org_id', org.id)
        .eq('status', 'active')
        .order('title')
      setActiveVacancies(data || [])
    }
    loadVacancies()
  }, [org?.id, supabase])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu cuenta</p>
      </div>

      {/* Profile (readonly) */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre completo</Label>
              <Input value={user?.full_name || ''} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rol</Label>
              <Input value={user?.role || 'recruiter'} disabled className="capitalize" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Input value={user?.is_active ? 'Activo' : 'Inactivo'} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base">Organización</CardTitle>
          <CardDescription>Información de tu empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre de la empresa</Label>
            <Input defaultValue={org?.name || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Slug</Label>
              <Input value={org?.slug || ''} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Logo URL</Label>
              <Input defaultValue={org?.logo_url || ''} placeholder="https://..." />
            </div>
          </div>
          <Button size="sm">Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Plan + Limits */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base">Plan actual</CardTitle>
          <CardDescription>Límites de tu plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-sm uppercase">
              {org?.plan || 'free'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Vacantes máximas</p>
              <p className="font-medium">{org?.max_vacancies || 3}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Candidatos/mes</p>
              <p className="font-medium">{org?.max_candidates_per_month || 100}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp / Selectia connection */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-green-600" />
            WhatsApp (Selectia)
          </CardTitle>
          <CardDescription>Conexión con el agente de WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{whatsappNumber}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Conectado
            </Badge>
          </div>

          {activeVacancies.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Vacancy Codes activos</p>
              <div className="space-y-1.5">
                {activeVacancies.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 dark:border-gray-800 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm truncate">{v.title}</p>
                      <code className="text-xs text-blue-600 dark:text-blue-400">{v.vacancy_code}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() =>
                        copyToClipboard(
                          `wa.me/${whatsappNumber?.replace(/\D/g, '')}?text=${v.vacancy_code}`,
                          v.id
                        )
                      }
                    >
                      {copied === v.id ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base">Apariencia</CardTitle>
          <CardDescription>Tema de la interfaz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="gap-2"
            >
              <Sun className="h-4 w-4" />
              Claro
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="gap-2"
            >
              <Moon className="h-4 w-4" />
              Oscuro
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Sistema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base">Notificaciones</CardTitle>
          <CardDescription>Configura tus preferencias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Nuevos candidatos</p>
              <p className="text-xs text-muted-foreground">Notificación cuando un candidato aplica</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Candidatos calificados</p>
              <p className="text-xs text-muted-foreground">Cuando un candidato supera el screening</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Escalación a humano</p>
              <p className="text-xs text-muted-foreground">Cuando el agente IA requiere intervención</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
