import Link from 'next/link'
import { TableRow, TableCell } from '@/components/ui/table'
import { StageBadge } from './stage-badge'
import { ScoreBadge } from './score-badge'
import type { CandidateWithVacancy } from '@/types/database'
import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  candidato: CandidateWithVacancy
}

export function CandidatoRow({ candidato }: Props) {
  return (
    <TableRow>
      <TableCell>
        <Link href={`/candidatos/${candidato.id}`} className="flex items-center gap-2 font-medium hover:underline">
          {candidato.is_starred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
          {candidato.full_name || 'Sin nombre'}
        </Link>
      </TableCell>
      <TableCell>{candidato.phone || '-'}</TableCell>
      <TableCell>{candidato.vacancy?.title || '-'}</TableCell>
      <TableCell><StageBadge stage={candidato.stage} /></TableCell>
      <TableCell><ScoreBadge score={candidato.score} /></TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatDistanceToNow(new Date(candidato.created_at), { addSuffix: true, locale: es })}
      </TableCell>
    </TableRow>
  )
}
