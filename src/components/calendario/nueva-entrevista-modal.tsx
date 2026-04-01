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
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function NuevaEntrevistaModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    const res = await fetch('/api/entrevistas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      toast.success('Entrevista programada')
      setOpen(false)
      router.refresh()
    } else {
      toast.error('Error al programar entrevista')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva entrevista
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar entrevista</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate_id">ID del candidato</Label>
            <Input id="candidate_id" name="candidate_id" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Fecha y hora</Label>
              <Input id="scheduled_at" name="scheduled_at" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duración (min)</Label>
              <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={30} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select name="interview_type" defaultValue="in_person">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">Presencial</SelectItem>
                <SelectItem value="video">Videollamada</SelectItem>
                <SelectItem value="phone">Telefónica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación / URL</Label>
            <Input id="location" name="location" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Programando...' : 'Programar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
