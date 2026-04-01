'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import type { Message } from '@/types/database'

interface Props {
  conversationId: string
  onMessageSent: (message: Message) => void
}

export function HumanTakeoverInput({ conversationId, onMessageSent }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, role: 'human' }),
    })
    if (res.ok) {
      const msg = await res.json()
      onMessageSent(msg)
      setText('')
    } else {
      toast.error('Error al enviar mensaje')
    }
    setSending(false)
  }

  return (
    <div className="flex gap-2 border-t p-4">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe un mensaje como reclutador..."
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
      />
      <Button onClick={handleSend} disabled={sending || !text.trim()} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
