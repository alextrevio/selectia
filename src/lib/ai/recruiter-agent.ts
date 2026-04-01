import Anthropic from '@anthropic-ai/sdk'
import type { KillerQuestion, Vacancy, Candidate, Message } from '@/types/database'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface AgentContext {
  vacancy: Vacancy
  candidate: Partial<Candidate>
  questions: KillerQuestion[]
  conversationHistory: Message[]
  currentQuestionIndex: number
}

function buildSystemPrompt(ctx: AgentContext): string {
  const { vacancy, questions } = ctx
  const customPrompt = vacancy.agent_system_prompt || ''
  const tone = vacancy.agent_tone || 'professional'

  return `Eres un reclutador de IA para "${vacancy.title}" en la empresa.
Tono: ${tone}. Comunicación por WhatsApp, mensajes breves y claros.

Descripción del puesto:
${vacancy.description || 'No especificada'}

Requisitos:
${vacancy.requirements || 'No especificados'}

Ubicación: ${vacancy.location || 'No especificada'}
Modalidad: ${vacancy.modality}

Tienes ${questions.length} preguntas clave que hacer al candidato.
Cada pregunta tiene un peso y algunas son eliminatorias.

Reglas:
1. Saluda cordialmente al candidato.
2. Haz las preguntas una por una, en orden.
3. Evalúa cada respuesta del 0-10 según qué tan bien cumple con lo esperado.
4. Si una pregunta es eliminatoria y la respuesta es < 4, informa amablemente que no cumple requisitos.
5. Al terminar todas las preguntas, genera un resumen y recomendación.
6. Mantén respuestas cortas (máximo 2-3 párrafos por mensaje).
7. Si el candidato hace preguntas sobre el puesto, responde brevemente con la info disponible.

${customPrompt}

Preguntas a realizar (en orden):
${questions.map((q, i) => `${i + 1}. [${q.question_type}${q.is_eliminatory ? ' - ELIMINATORIA' : ''}] ${q.question_text} (Respuesta esperada: ${q.expected_answer || 'Abierta'}, Peso: ${q.weight})`).join('\n')}

IMPORTANTE: Responde SOLO con el mensaje para el candidato. No incluyas metadatos.
Si necesitas evaluar una respuesta, incluye al final del mensaje una línea oculta con formato:
[SCORE:X] donde X es 0-10.
Si debes hacer la siguiente pregunta, inclúyela naturalmente en tu respuesta.`
}

export async function generateAgentResponse(ctx: AgentContext): Promise<{
  message: string
  score: number | null
  isComplete: boolean
}> {
  const systemPrompt = buildSystemPrompt(ctx)

  const messages: Anthropic.MessageParam[] = ctx.conversationHistory.map((m) => ({
    role: m.role === 'candidate' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }))

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.length > 0 ? messages : [{ role: 'user', content: 'Hola, me interesa la vacante' }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract score if present
  const scoreMatch = text.match(/\[SCORE:(\d+)\]/)
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null
  const cleanMessage = text.replace(/\[SCORE:\d+\]/, '').trim()

  const isComplete = ctx.currentQuestionIndex >= ctx.questions.length - 1 && score !== null

  return { message: cleanMessage, score, isComplete }
}

export async function generateCandidateSummary(ctx: AgentContext): Promise<{
  summary: string
  recommendation: string
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: 'Eres un asistente de RRHH. Genera un resumen ejecutivo del candidato basado en la conversación.',
    messages: [
      {
        role: 'user',
        content: `Vacante: ${ctx.vacancy.title}
Candidato: ${ctx.candidate.full_name || 'Desconocido'}
Conversación:
${ctx.conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}

Genera:
1. Un resumen breve (2-3 oraciones)
2. Una recomendación (contratar/considerar/rechazar) con justificación breve`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parts = text.split(/recomendaci[oó]n[:\s]*/i)

  return {
    summary: parts[0]?.trim() || text,
    recommendation: parts[1]?.trim() || 'Sin recomendación',
  }
}
