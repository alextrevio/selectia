'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StageBadge } from './stage-badge'
import { ScoreBadge } from './score-badge'
import type { Candidate } from '@/types/database'
import { Phone, Mail, MapPin, Star, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  candidato: Candidate
}

export function CandidatoProfile({ candidato }: Props) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const saveNote = async () => {
    setSaving(true)
    const res = await fetch(`/api/candidatos/${candidato.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    if (res.ok) {
      toast.success('Nota guardada')
      setNote('')
    } else {
      toast.error('Error al guardar nota')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {candidato.is_starred && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
                {candidato.full_name || 'Sin nombre'}
              </CardTitle>
              <div className="mt-2 flex items-center gap-3">
                <StageBadge stage={candidato.stage} />
                <ScoreBadge score={candidato.score} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidato.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {candidato.phone}
            </div>
          )}
          {candidato.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {candidato.email}
            </div>
          )}
          {candidato.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {candidato.location}
            </div>
          )}
          {candidato.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidato.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          )}
          {candidato.experience_summary && (
            <div>
              <p className="text-sm font-medium mb-1">Experiencia</p>
              <p className="text-sm text-muted-foreground">{candidato.experience_summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar nota</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe una nota sobre el candidato..."
              rows={2}
            />
            <Button onClick={saveNote} disabled={saving || !note.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
