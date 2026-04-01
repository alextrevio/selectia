'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { MessageBubble } from './message-bubble'
import { HumanTakeoverInput } from './human-takeover-input'
import type { Message, ConversationStatus } from '@/types/database'
import { MessageCircle } from 'lucide-react'

interface Props {
  conversationId?: string
  candidateId: string
  initialMessages: Message[]
  conversationStatus?: ConversationStatus | null
}

export function ChatPanel({
  conversationId,
  candidateId,
  initialMessages,
  conversationStatus,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const showInput = conversationId && conversationStatus === 'waiting_human'

  return (
    <Card className="flex h-[calc(100vh-220px)] flex-col border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <MessageCircle className="h-4 w-4 text-green-600" />
            Conversación
          </CardTitle>
          {conversationStatus && (
            <Badge
              variant="secondary"
              className={
                conversationStatus === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : conversationStatus === 'waiting_human'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    : conversationStatus === 'completed'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      : 'bg-gray-100 text-gray-600'
              }
            >
              {conversationStatus === 'active' && 'Activa'}
              {conversationStatus === 'waiting_human' && 'Esperando humano'}
              {conversationStatus === 'completed' && 'Completada'}
              {conversationStatus === 'expired' && 'Expirada'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <ScrollArea className="flex-1">
          <div className="bg-[#ECE5DD]/30 dark:bg-gray-900/50 min-h-full px-4">
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
          </div>
        </ScrollArea>
        {showInput && (
          <HumanTakeoverInput
            conversationId={conversationId}
            onMessageSent={handleNewMessage}
          />
        )}
        {conversationId && !showInput && conversationStatus !== 'completed' && (
          <div className="border-t px-4 py-2 text-xs text-center text-muted-foreground">
            El agente IA está gestionando la conversación
          </div>
        )}
      </CardContent>
    </Card>
  )
}
