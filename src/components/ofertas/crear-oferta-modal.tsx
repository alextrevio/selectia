'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
import {
  DEPARTMENT_OPTIONS,
  MODALITY_OPTIONS,
  LEVEL_OPTIONS,
} from '@/lib/constants'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, GripVertical, Trash2, MessageCircle, Copy } from 'lucide-react'
import { toast } from 'sonner'
import type { QuestionType } from '@/types/database'

interface QuestionItem {
  id: string
  question_text: string
  question_type: QuestionType
  expected_answer: string
  weight: number
  is_eliminatory: boolean
}

const QUESTION_TEMPLATES = [
  { label: 'Experiencia', text: '¿Cuántos años de experiencia tienes en el área?', type: 'numeric' as QuestionType },
  { label: 'Disponibilidad', text: '¿Cuál es tu disponibilidad para comenzar?', type: 'text' as QuestionType },
  { label: 'Ubicación', text: '¿En qué ciudad te encuentras actualmente?', type: 'location' as QuestionType },
  { label: 'Salario esperado', text: '¿Cuál es tu expectativa salarial mensual?', type: 'numeric' as QuestionType },
]

function SortableQuestion({
  q,
  index,
  onRemove,
}: {
  q: QuestionItem
  index: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: q.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const typeLabels: Record<QuestionType, string> = {
    text: 'Texto',
    yes_no: 'Sí/No',
    multiple_choice: 'Opción múltiple',
    numeric: 'Numérico',
    location: 'Ubicación',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-900"
    >
      <button
        className="cursor-grab text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{q.question_text}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{typeLabels[q.question_type]}</span>
          <span className="text-[10px] text-muted-foreground">· Peso: {q.weight}</span>
          {q.is_eliminatory && (
            <span className="text-[10px] text-red-600 font-medium">Eliminatoria</span>
          )}
        </div>
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 p-1">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function CrearOfertaModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Helper to handle base-ui Select's (value: string | null) signature
  const selectHandler = (setter: (v: string) => void) => (v: string | null) => setter(v ?? '')

  // Form state
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [location, setLocation] = useState('')
  const [modality, setModality] = useState('on_site')
  const [level, setLevel] = useState('')
  const [status, setStatus] = useState('draft')
  const [description, setDescription] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')

  // Questions
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('text')
  const [newExpectedAnswer, setNewExpectedAnswer] = useState('')
  const [newWeight, setNewWeight] = useState(50)
  const [newEliminatory, setNewEliminatory] = useState(false)

  // Agent config
  const [agentTone, setAgentTone] = useState('professional')
  const [agentGreeting, setAgentGreeting] = useState('')
  const [autoRejectBelow, setAutoRejectBelow] = useState(30)
  const [escalateAbove, setEscalateAbove] = useState(80)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const addQuestion = () => {
    if (!newQuestionText.trim()) return
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question_text: newQuestionText.trim(),
        question_type: newQuestionType,
        expected_answer: newExpectedAnswer,
        weight: newWeight,
        is_eliminatory: newEliminatory,
      },
    ])
    setNewQuestionText('')
    setNewExpectedAnswer('')
    setNewWeight(50)
    setNewEliminatory(false)
  }

  const addTemplate = (tpl: (typeof QUESTION_TEMPLATES)[0]) => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${Math.random()}`,
        question_text: tpl.text,
        question_type: tpl.type,
        expected_answer: '',
        weight: 50,
        is_eliminatory: false,
      },
    ])
  }

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setQuestions((prev) => {
      const oldIdx = prev.findIndex((q) => q.id === active.id)
      const newIdx = prev.findIndex((q) => q.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  const handleSubmit = async (publishNow: boolean) => {
    if (!title.trim()) {
      toast.error('El título es obligatorio')
      return
    }
    setLoading(true)

    const finalStatus = publishNow ? 'active' : status

    // 1. Create vacancy
    const res = await fetch('/api/ofertas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        department,
        location,
        modality,
        level,
        status: finalStatus,
        description,
        salary_min: salaryMin || null,
        salary_max: salaryMax || null,
        agent_tone: agentTone,
        agent_greeting: agentGreeting || null,
        auto_reject_below: autoRejectBelow,
        escalate_to_human_above: escalateAbove,
        published_at: publishNow ? new Date().toISOString() : null,
      }),
    })

    if (!res.ok) {
      toast.error('Error al crear la oferta')
      setLoading(false)
      return
    }

    const oferta = await res.json()

    // 2. Save questions
    if (questions.length > 0) {
      await fetch(`/api/ofertas/${oferta.id}/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questions.map((q, i) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            expected_answer: q.expected_answer,
            weight: q.weight,
            is_eliminatory: q.is_eliminatory,
            sort_order: i,
          })),
        }),
      })
    }

    if (publishNow && oferta.vacancy_code) {
      const wavNumber = process.env.NEXT_PUBLIC_ZAVU_WHATSAPP_NUMBER || ''
      toast.success(
        <div>
          <p className="font-medium">Oferta publicada</p>
          <p className="text-xs mt-1">
            Código: <span className="font-mono font-bold">{oferta.vacancy_code}</span>
          </p>
          {wavNumber && (
            <p className="text-xs mt-0.5">
              WhatsApp: wa.me/{wavNumber}?text={oferta.vacancy_code}
            </p>
          )}
        </div>,
        { duration: 8000 }
      )
    } else {
      toast.success('Oferta guardada como borrador')
    }

    setOpen(false)
    router.push(`/ofertas/${oferta.id}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" />}>
        <Plus className="h-4 w-4" />
        Crear Oferta
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nueva oferta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* SECTION 1: Info del puesto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Info del puesto
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Desarrollador Full Stack"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Departamento *</Label>
                  <Select value={department} onValueChange={selectHandler(setDepartment)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ciudad, País"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Modalidad</Label>
                  <Select value={modality} onValueChange={selectHandler(setModality)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODALITY_OPTIONS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Nivel</Label>
                  <Select value={level} onValueChange={selectHandler(setLevel)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Select value={status} onValueChange={selectHandler(setStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="active">Activa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe las responsabilidades del puesto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="salary_min">Salario mínimo MXN</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="salary_max">Salario máximo MXN</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* SECTION 2: Preguntas de Perfilamiento */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Preguntas de Perfilamiento
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Agrega preguntas que el candidato deberá responder al aplicar
            </p>

            {/* Templates */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUESTION_TEMPLATES.map((tpl) => (
                <Button
                  key={tpl.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => addTemplate(tpl)}
                >
                  <Copy className="h-3 w-3" />
                  {tpl.label}
                </Button>
              ))}
            </div>

            {/* Questions list with dnd */}
            {questions.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5 mb-3">
                    {questions.map((q, i) => (
                      <SortableQuestion
                        key={q.id}
                        q={q}
                        index={i}
                        onRemove={() => removeQuestion(q.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Add question form */}
            <div className="rounded-md border border-dashed border-gray-300 p-3 dark:border-gray-700 space-y-2.5">
              <Input
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Escribe una pregunta..."
                className="text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={newQuestionType} onValueChange={(v: string | null) => setNewQuestionType((v ?? 'text') as QuestionType)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="yes_no">Sí/No</SelectItem>
                    <SelectItem value="multiple_choice">Opción múltiple</SelectItem>
                    <SelectItem value="numeric">Numérico</SelectItem>
                    <SelectItem value="location">Ubicación</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newExpectedAnswer}
                  onChange={(e) => setNewExpectedAnswer(e.target.value)}
                  placeholder="Respuesta esperada (opc.)"
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs">Peso</Label>
                    <span className="text-xs text-muted-foreground">{newWeight}</span>
                  </div>
                  <Slider
                    value={[newWeight]}
                    onValueChange={(v) => setNewWeight(Array.isArray(v) ? v[0] : v)}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={newEliminatory}
                    onCheckedChange={setNewEliminatory}
                    className="scale-75"
                  />
                  <Label className="text-xs whitespace-nowrap">Eliminatoria</Label>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={addQuestion}
                  disabled={!newQuestionText.trim()}
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* SECTION 3: Configuración del Agente */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Configuración del Agente
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Tono</Label>
                <Select value={agentTone} onValueChange={selectHandler(setAgentTone)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profesional</SelectItem>
                    <SelectItem value="friendly">Amigable</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="greeting">Mensaje de bienvenida</Label>
                <Textarea
                  id="greeting"
                  value={agentGreeting}
                  onChange={(e) => setAgentGreeting(e.target.value)}
                  placeholder="¡Hola! Gracias por tu interés en esta posición. Soy el asistente de selección y te haré algunas preguntas..."
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Score mínimo para pasar</Label>
                    <span className="text-xs font-mono text-muted-foreground">{autoRejectBelow}</span>
                  </div>
                  <Slider
                    value={[autoRejectBelow]}
                    onValueChange={(v) => setAutoRejectBelow(Array.isArray(v) ? v[0] : v)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Score para escalar a humano</Label>
                    <span className="text-xs font-mono text-muted-foreground">{escalateAbove}</span>
                  </div>
                  <Slider
                    value={[escalateAbove]}
                    onValueChange={(v) => setEscalateAbove(Array.isArray(v) ? v[0] : v)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar borrador'}
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleSubmit(true)}
            disabled={loading}
          >
            {loading ? 'Publicando...' : 'Crear y Publicar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
