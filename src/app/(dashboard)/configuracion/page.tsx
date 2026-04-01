'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useOrg } from '@/hooks/use-org'
import { useUser } from '@/hooks/use-user'

export default function ConfiguracionPage() {
  const { org } = useOrg()
  const { user } = useUser()

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
