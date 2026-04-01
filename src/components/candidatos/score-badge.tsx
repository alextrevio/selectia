import { cn } from '@/lib/utils'

interface Props {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: Props) {
  const color =
    score >= 70
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : score >= 30
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'

  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', color, className)}>
      {score}/100
    </span>
  )
}
