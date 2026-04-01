import { cn } from '@/lib/utils'
import type { Message } from '@/types/database'
import { format } from 'date-fns'
import { Bot, User, UserCheck } from 'lucide-react'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const isCandidate = message.role === 'candidate'
  const isAgent = message.role === 'agent'

  return (
    <div className={cn('flex gap-2', isCandidate ? 'justify-start' : 'justify-end')}>
      {isCandidate && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2 text-sm',
          isCandidate
            ? 'bg-muted'
            : isAgent
              ? 'bg-primary text-primary-foreground'
              : 'bg-blue-100 text-blue-900'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={cn('mt-1 text-[10px]', isCandidate ? 'text-muted-foreground' : 'opacity-70')}>
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
      {!isCandidate && (
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full', isAgent ? 'bg-primary/10' : 'bg-blue-100')}>
          {isAgent ? <Bot className="h-4 w-4 text-primary" /> : <UserCheck className="h-4 w-4 text-blue-600" />}
        </div>
      )}
    </div>
  )
}
