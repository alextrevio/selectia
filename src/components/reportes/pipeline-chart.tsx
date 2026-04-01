'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { STAGE_LABELS, PIPELINE_STAGES } from '@/lib/constants'
import type { CandidateStage } from '@/types/database'

interface Props {
  data: Record<CandidateStage, number>
}

export function PipelineChart({ data }: Props) {
  const chartData = PIPELINE_STAGES.map((stage) => ({
    name: STAGE_LABELS[stage],
    total: data[stage] || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline por etapa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
