import { cn } from '@/lib/utils'

interface Props {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: Props) {
  const color =
    score >= 80
      ? 'bg-green-100 text-green-800'
      : score >= 50
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800'

  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', color, className)}>
      {score}/100
    </span>
  )
}
