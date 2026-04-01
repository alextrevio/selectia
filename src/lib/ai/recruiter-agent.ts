import Anthropic from '@anthropic-ai/sdk'
import type { KillerQuestion, Vacancy, Message } from '@/types/database'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AgentResponse {
  response: string
  killer_question_answered: {
    question_id: string
    score: number
    reasoning: string
  } | null
  next_action: 'ask_next' | 'complete' | 'reject' | 'escalate'
  extracted_data: {
    name?: string
    age?: number
    location?: string
    email?: string
  } | null
}

export function buildSystemPrompt(
  orgName: string,
  vacancy: Vacancy,
  killerQuestions: KillerQuestion[]
): string {
  const questionsBlock = killerQuestions
    .map(
      (q, i) =>
        `${i + 1}. [ID: ${q.id}] [Tipo: ${q.question_type}] [Peso: ${q.weight}]${q.is_eliminatory ? ' [ELIMINATORIA]' : ''}
   Pregunta: ${q.question_text}
   Respuesta esperada: ${q.expected_answer || 'Abierta'}
   ${q.options ? `Opciones: ${JSON.stringify(q.options)}` : ''}`
    )
    .join('\n\n')

  return `Eres un reclutador virtual de "${orgName}" que gestiona la vacante "${vacancy.title}" por WhatsApp.
Tono: ${vacancy.agent_tone || 'professional'}. Comunícate en español mexicano, mensajes breves y naturales.

DATOS DE LA VACANTE:
- Título: ${vacancy.title}
- Descripción: ${vacancy.description || 'No especificada'}
- Requisitos: ${vacancy.requirements || 'No especificados'}
- Ubicación: ${vacancy.location || 'No especificada'}
- Modalidad: ${vacancy.modality}
- Nivel: ${vacancy.level || 'No especificado'}
${vacancy.salary_min ? `- Salario: $${vacancy.salary_min} - $${vacancy.salary_max} ${vacancy.salary_period}` : ''}

PREGUNTAS DE PERFILAMIENTO (haz UNA POR UNA, en orden):
${questionsBlock || 'No hay preguntas configuradas.'}

REGLAS:
1. Haz las preguntas UNA POR UNA, de forma conversacional y natural.
2. Evalúa cada respuesta del candidato de 0 a 10 según qué tan bien cumple lo esperado.
3. Si una pregunta es ELIMINATORIA y el score es < 3, indica que no cumple requisitos amablemente y usa next_action "reject".
4. Extrae datos del candidato de la conversación (nombre, edad, ubicación, email) sin pedirlos directamente si ya se mencionaron.
5. NO inventes información que el candidato no haya dicho.
6. Mantén mensajes cortos, máximo 2-3 líneas por respuesta.
7. Si el candidato hace preguntas sobre el puesto, responde con la info que tienes.
8. Al terminar todas las preguntas, resume y despide cordialmente, usa next_action "complete".
9. Si el candidato parece muy calificado o tiene preguntas complejas, usa "escalate" para pasar a un reclutador humano.

Responde SIEMPRE con JSON válido y nada más:
{
  "response": "Tu mensaje al candidato aquí",
  "killer_question_answered": { "question_id": "uuid-de-la-pregunta", "score": 0-10, "reasoning": "breve razón del score" } | null,
  "next_action": "ask_next" | "complete" | "reject" | "escalate",
  "extracted_data": { "name": "...", "age": 25, "location": "...", "email": "..." } | null
}`
}

export async function processMessage(
  candidateMessage: string,
  systemPrompt: string,
  history: Message[],
  _killerQuestions: KillerQuestion[]
): Promise<AgentResponse> {
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role === 'candidate' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }))

  // Add the latest candidate message
  messages.push({ role: 'user', content: candidateMessage })

  const parse = async (attempt: number): Promise<AgentResponse> => {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20241022',
      max_tokens: 1024,
      temperature: 0.3,
      system: systemPrompt,
      messages,
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      if (attempt < 1) return parse(attempt + 1)
      return {
        response: text.slice(0, 500),
        killer_question_answered: null,
        next_action: 'ask_next',
        extracted_data: null,
      }
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as AgentResponse
      if (!parsed.response || !parsed.next_action) {
        if (attempt < 1) return parse(attempt + 1)
        return {
          response: parsed.response || text.slice(0, 500),
          killer_question_answered: null,
          next_action: 'ask_next',
          extracted_data: null,
        }
      }
      return parsed
    } catch {
      if (attempt < 1) return parse(attempt + 1)
      return {
        response: text.replace(/```json?|```/g, '').slice(0, 500),
        killer_question_answered: null,
        next_action: 'ask_next',
        extracted_data: null,
      }
    }
  }

  try {
    return await parse(0)
  } catch (error) {
    console.error('AI agent error:', error)
    return {
      response:
        'Disculpa, tuve un problema técnico. ¿Podrías repetir tu mensaje?',
      killer_question_answered: null,
      next_action: 'ask_next',
      extracted_data: null,
    }
  }
}
