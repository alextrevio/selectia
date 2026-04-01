'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { KillerQuestion, QuestionType } from '@/types/database'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  vacancyId: string
  initialQuestions: KillerQuestion[]
}

interface QuestionForm {
  id?: string
  question_text: string
  question_type: QuestionType
  expected_answer: string
  weight: number
  is_eliminatory: boolean
  sort_order: number
}

export function KillerQuestionsEditor({ vacancyId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<QuestionForm[]>(
    initialQuestions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      expected_answer: q.expected_answer || '',
      weight: q.weight,
      is_eliminatory: q.is_eliminatory,
      sort_order: q.sort_order,
    }))
  )
  const [saving, setSaving] = useState(false)

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        expected_answer: '',
        weight: 10,
        is_eliminatory: false,
        sort_order: questions.length,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof QuestionForm, value: unknown) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const saveQuestions = async () => {
    setSaving(true)
    const res = await fetch(`/api/ofertas/${vacancyId}/questions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    })
    if (res.ok) {
      toast.success('Preguntas guardadas')
    } else {
      toast.error('Error al guardar')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Killer Questions</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" /> Agregar pregunta
          </Button>
          <Button onClick={saveQuestions} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No hay preguntas. Agrega preguntas para que el agente IA las haga a los candidatos.
        </p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <GripVertical className="mt-2 h-5 w-5 text-muted-foreground cursor-grab" />
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <Label>Pregunta {i + 1}</Label>
                      <Input
                        value={q.question_text}
                        onChange={(e) => updateQuestion(i, 'question_text', e.target.value)}
                        placeholder="Escribe la pregunta..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label>Tipo</Label>
                        <Select
                          value={q.question_type}
                          onValueChange={(v: string | null) => updateQuestion(i, 'question_type', v ?? 'text')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="yes_no">Sí/No</SelectItem>
                            <SelectItem value="multiple_choice">Opción múltiple</SelectItem>
                            <SelectItem value="numeric">Numérico</SelectItem>
                            <SelectItem value="location">Ubicación</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Respuesta esperada</Label>
                        <Input
                          value={q.expected_answer}
                          onChange={(e) => updateQuestion(i, 'expected_answer', e.target.value)}
                          placeholder="Opcional"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Peso (1-100)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={q.weight}
                          onChange={(e) => updateQuestion(i, 'weight', parseInt(e.target.value) || 10)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={q.is_eliminatory}
                        onCheckedChange={(v) => updateQuestion(i, 'is_eliminatory', v)}
                      />
                      <Label>Pregunta eliminatoria</Label>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(i)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
