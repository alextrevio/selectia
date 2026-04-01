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
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  vacancyId?: string
}

export function AddCandidatoModal({ vacancyId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      ...Object.fromEntries(formData.entries()),
      vacancy_id: vacancyId,
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
      <DialogTrigger render={<Button variant="outline" />}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar candidato
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar candidato manualmente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
            <Input id="phone" name="phone" placeholder="+52..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
