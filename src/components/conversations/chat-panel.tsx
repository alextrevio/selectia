'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import { HumanTakeoverInput } from './human-takeover-input'
import type { Message } from '@/types/database'
import { MessageCircle } from 'lucide-react'

interface Props {
  conversationId?: string
  candidateId: string
  initialMessages: Message[]
}

export function ChatPanel({ conversationId, candidateId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  return (
    <Card className="flex h-[calc(100vh-250px)] flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" />
          Conversación
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <ScrollArea className="flex-1 px-4">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No hay mensajes en esta conversación
            </p>
          ) : (
            <div className="space-y-3 py-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
        {conversationId && (
          <HumanTakeoverInput
            conversationId={conversationId}
            onMessageSent={handleNewMessage}
          />
        )}
      </CardContent>
    </Card>
  )
}
