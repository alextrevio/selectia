import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { phone, text } = body

  if (!phone || !text) {
    return NextResponse.json(
      { error: 'Missing phone or text' },
      { status: 400 }
    )
  }

  // Build a Zavu-like webhook payload
  const webhookPayload = {
    from: phone,
    text: { body: text },
    id: `test-${Date.now()}`,
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const res = await fetch(`${appUrl}/api/webhook/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    })

    const result = await res.json()
    return NextResponse.json({
      ...result,
      _test: true,
      _phone: phone,
      _text: text,
    })
  } catch (error) {
    console.error('Simulate message error:', error)
    return NextResponse.json(
      { error: 'Failed to simulate message', details: String(error) },
      { status: 500 }
    )
  }
}
