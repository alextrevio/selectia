import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const body = await request.json()
  const { from, text, vacancy_code } = body

  const webhookPayload = {
    from,
    text: { body: text || vacancy_code || 'Hola' },
    id: `test-${Date.now()}`,
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload),
  })

  const result = await res.json()
  return NextResponse.json(result)
}
