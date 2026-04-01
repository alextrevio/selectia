import Zavudev from '@zavudev/sdk'

const zavu = new Zavudev({ apiKey: process.env.ZAVU_API_KEY! })

export async function sendText(to: string, text: string) {
  return (zavu.messages as unknown as { send: (params: Record<string, unknown>) => Promise<unknown> }).send({
    to,
    from: process.env.ZAVU_WHATSAPP_NUMBER!,
    type: 'text',
    text: { body: text },
  })
}

export async function sendButtons(
  to: string,
  text: string,
  buttons: { id: string; title: string }[]
) {
  return (zavu.messages as unknown as { send: (params: Record<string, unknown>) => Promise<unknown> }).send({
    to,
    from: process.env.ZAVU_WHATSAPP_NUMBER!,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply' as const,
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  })
}

export { zavu }
