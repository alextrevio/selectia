'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/hooks/use-user'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function ConfiguracionPage() {
  const { user, org } = useUser()
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organización</CardTitle>
          <CardDescription>Información de tu empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre de la empresa</Label>
            <Input defaultValue={org?.name || ''} />
          </div>
          <div className="space-y-2">
            <Label>Plan actual</Label>
            <Input value={org?.plan || 'free'} disabled />
          </div>
          <Button>Guardar cambios</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input defaultValue={user?.full_name || ''} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <Button>Actualizar perfil</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Configura tus preferencias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Nuevos candidatos</p>
              <p className="text-sm text-muted-foreground">Notificación cuando un candidato aplica</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Candidatos calificados</p>
              <p className="text-sm text-muted-foreground">Cuando un candidato supera el screening</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Escalación a humano</p>
              <p className="text-sm text-muted-foreground">Cuando el agente IA requiere intervención</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
