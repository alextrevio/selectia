import Zavudev from '@zavudev/sdk'

const zavu = new Zavudev({ apiKey: process.env.ZAVU_API_KEY! })

export async function sendWhatsAppText(to: string, text: string) {
  return zavu.messages.send({
    to,
    channel: 'whatsapp',
    text,
  })
}

export async function sendWhatsAppButtons(
  to: string,
  text: string,
  buttons: { id: string; title: string }[]
) {
  return zavu.messages.send({
    to,
    channel: 'whatsapp',
    messageType: 'buttons',
    text,
    content: { buttons },
  })
}

export { zavu }
