import { Badge } from '@/components/ui/badge'
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/constants'
import type { CandidateStage } from '@/types/database'

interface Props {
  stage: CandidateStage
}

export function StageBadge({ stage }: Props) {
  return (
    <Badge className={STAGE_COLORS[stage]} variant="secondary">
      {STAGE_LABELS[stage]}
    </Badge>
  )
}
