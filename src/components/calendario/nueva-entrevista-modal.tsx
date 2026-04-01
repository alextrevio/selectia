'use client'

import { useState, useMemo } from 'react'
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
import type { Vacancy, Candidate } from '@/types/database'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  vacancies: Pick<Vacancy, 'id' | 'title'>[]
  candidates: Pick<Candidate, 'id' | 'full_name' | 'vacancy_id'>[]
}

export function NuevaEntrevistaModal({ vacancies, candidates }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [candidateSearch, setCandidateSearch] = useState('')
  const [selectedVacancy, setSelectedVacancy] = useState('')
  const [interviewType, setInterviewType] = useState('in_person')
  const [duration, setDuration] = useState('30')
  const router = useRouter()

  // Filter candidates by search
  const filteredCandidates = useMemo(() => {
    if (!candidateSearch) return candidates.slice(0, 20)
    const q = candidateSearch.toLowerCase()
    return candidates.filter((c) => c.full_name?.toLowerCase().includes(q)).slice(0, 20)
  }, [candidates, candidateSearch])

  // Auto-fill vacancy when candidate selected
  const handleCandidateChange = (candidateId: string | null) => {
    if (!candidateId) return
    setSelectedCandidate(candidateId)
    const cand = candidates.find((c) => c.id === candidateId)
    if (cand?.vacancy_id) {
      const vac = vacancies.find((v) => v.id === cand.vacancy_id)
      if (vac) setSelectedVacancy(vac.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const data = {
      candidate_id: selectedCandidate,
      vacancy_id: selectedVacancy || null,
      title: formData.get('title'),
      interview_type: interviewType,
      scheduled_at: formData.get('scheduled_at'),
      duration_minutes: parseInt(duration),
      location: interviewType === 'in_person' ? formData.get('location') : null,
      meeting_url: interviewType === 'video' ? formData.get('meeting_url') : null,
      notes: formData.get('notes') || null,
    }

    const res = await fetch('/api/entrevistas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      toast.success('Entrevista programada')
      setOpen(false)
      setSelectedCandidate('')
      setSelectedVacancy('')
      setCandidateSearch('')
      router.refresh()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Error al programar entrevista')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" />}>
        <Plus className="h-4 w-4" />
        Nueva Entrevista
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Programar entrevista</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Candidate */}
          <div className="space-y-1.5">
            <Label>Candidato *</Label>
            <Input
              placeholder="Buscar candidato..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="mb-1"
            />
            <Select value={selectedCandidate} onValueChange={handleCandidateChange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Seleccionar candidato" />
              </SelectTrigger>
              <SelectContent>
                {filteredCandidates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name || 'Sin nombre'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vacancy (auto-filled) */}
          <div className="space-y-1.5">
            <Label>Oferta</Label>
            <Select value={selectedVacancy} onValueChange={(v: string | null) => setSelectedVacancy(v ?? '')}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Auto-detectada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ninguna</SelectItem>
                {vacancies.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Titulo *</Label>
            <Input id="title" name="title" placeholder="Entrevista tecnica" required />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={interviewType} onValueChange={(v: string | null) => setInterviewType(v ?? 'in_person')}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">Presencial</SelectItem>
                <SelectItem value="video">Videollamada</SelectItem>
                <SelectItem value="phone">Telefonica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="scheduled_at">Fecha y hora *</Label>
              <Input id="scheduled_at" name="scheduled_at" type="datetime-local" required />
            </div>
            <div className="space-y-1.5">
              <Label>Duracion</Label>
              <Select value={duration} onValueChange={(v: string | null) => setDuration(v ?? '30')}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location / URL */}
          {interviewType === 'in_person' && (
            <div className="space-y-1.5">
              <Label htmlFor="location">Ubicacion</Label>
              <Input id="location" name="location" placeholder="Oficina principal" />
            </div>
          )}
          {interviewType === 'video' && (
            <div className="space-y-1.5">
              <Label htmlFor="meeting_url">URL de la reunion</Label>
              <Input id="meeting_url" name="meeting_url" placeholder="https://meet.google.com/..." />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" rows={2} placeholder="Instrucciones adicionales..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !selectedCandidate}
            >
              {loading ? 'Programando...' : 'Programar entrevista'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
