import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/constants'

interface Props {
  counts: Record<string, number>
}

export function PipelineSummary({ counts }: Props) {
  const total = PIPELINE_STAGES.reduce((sum, s) => sum + (counts[s] || 0), 0)

  return (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {PIPELINE_STAGES.map((stage) => {
          const count = counts[stage] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={stage} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STAGE_COLORS[stage]}`}>
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.max(pct, 0)}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
