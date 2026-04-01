'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

export function PipelineSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage} className="flex items-center justify-between">
              <Badge className={STAGE_COLORS[stage]} variant="secondary">
                {STAGE_LABELS[stage]}
              </Badge>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
