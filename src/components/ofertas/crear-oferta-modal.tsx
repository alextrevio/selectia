'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MODALITY_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, LEVEL_OPTIONS } from '@/lib/constants'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function CrearOfertaModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    const res = await fetch('/api/ofertas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      toast.error('Error al crear la oferta')
      setLoading(false)
      return
    }

    const oferta = await res.json()
    toast.success('Oferta creada exitosamente')
    setOpen(false)
    router.push(`/ofertas/${oferta.id}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva oferta
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nueva oferta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del puesto *</Label>
            <Input id="title" name="title" placeholder="Ej: Desarrollador Full Stack" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={3} placeholder="Describe el puesto..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos</Label>
            <Textarea id="requirements" name="requirements" rows={3} placeholder="Requisitos del puesto..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" name="location" placeholder="Ciudad, País" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input id="department" name="department" placeholder="Ej: Tecnología" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Modalidad</Label>
              <Select name="modality" defaultValue="on_site">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODALITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de empleo</Label>
              <Select name="employment_type" defaultValue="full_time">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nivel</Label>
              <Select name="level">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Salario mínimo</Label>
              <Input id="salary_min" name="salary_min" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_max">Salario máximo</Label>
              <Input id="salary_max" name="salary_max" type="number" placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear oferta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
