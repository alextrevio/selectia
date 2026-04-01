import { cn } from '@/lib/utils'
import type { Message } from '@/types/database'
import { format } from 'date-fns'
import { Bot, UserCheck } from 'lucide-react'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const isCandidate = message.role === 'candidate'
  const isAgent = message.role === 'agent'
  const isHuman = message.role === 'human'

  return (
    <div className={cn('flex', isCandidate ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'relative max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm',
          isCandidate
            ? 'bg-white dark:bg-gray-800 rounded-tl-none'
            : isAgent
              ? 'bg-blue-500 text-white rounded-tr-none'
              : 'bg-green-500 text-white rounded-tr-none'
        )}
      >
        {/* Role badge */}
        {!isCandidate && (
          <div className="flex items-center gap-1 mb-1">
            {isAgent ? (
              <>
                <Bot className="h-3 w-3" />
                <span className="text-[10px] font-medium opacity-80">Agente IA</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3 w-3" />
                <span className="text-[10px] font-medium opacity-80">Reclutador</span>
              </>
            )}
          </div>
        )}

        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Killer question score */}
        {message.is_killer_question && message.candidate_answer_score != null && (
          <div className={cn(
            'mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
            isCandidate
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              : 'bg-white/20'
          )}>
            Pregunta filtrado: {message.candidate_answer_score}/10
          </div>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            'mt-1 text-[10px] text-right',
            isCandidate ? 'text-gray-400' : 'opacity-60'
          )}
        >
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </div>
  )
}
