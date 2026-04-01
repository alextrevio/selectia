'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { STAGE_LABELS } from '@/lib/constants'
import type { Vacancy, CandidateStage } from '@/types/database'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  vacancyId?: string
  vacancies?: Pick<Vacancy, 'id' | 'title'>[]
}

export function AddCandidatoModal({ vacancyId, vacancies = [] }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedVacancy, setSelectedVacancy] = useState(vacancyId || '')
  const [stage, setStage] = useState<string>('new')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const skillsRaw = formData.get('skills') as string
    const skills = skillsRaw
      ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const data = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      location: formData.get('location') || null,
      skills,
      vacancy_id: selectedVacancy || null,
      stage,
      source: 'manual',
    }

    const res = await fetch('/api/candidatos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      toast.error('Error al agregar candidato')
      setLoading(false)
      return
    }

    toast.success('Candidato agregado')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" />}>
        <Plus className="h-4 w-4" />
        Añadir Candidato
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir candidato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nombre completo *</Label>
            <Input id="full_name" name="full_name" placeholder="Juan Pérez" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" placeholder="juan@email.com" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" placeholder="+52..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" name="location" placeholder="Ciudad, País" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (separadas por coma)</Label>
            <Input id="skills" name="skills" placeholder="React, Node.js, TypeScript" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Oferta asociada</Label>
              <Select value={selectedVacancy} onValueChange={(v: string | null) => setSelectedVacancy(v ?? '')}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguna</SelectItem>
                  {vacancies.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Etapa inicial</Label>
              <Select value={stage} onValueChange={(v: string | null) => setStage(v ?? 'new')}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(STAGE_LABELS) as [CandidateStage, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'Agregando...' : 'Añadir candidato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
