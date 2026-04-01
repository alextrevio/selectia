import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, CheckCircle, TrendingUp } from 'lucide-react'

interface Props {
  totalVacancies: number
  activeVacancies: number
  totalCandidates: number
}

export function DashboardStats({ totalVacancies, activeVacancies, totalCandidates }: Props) {
  const stats = [
    { label: 'Total ofertas', value: totalVacancies, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Ofertas activas', value: activeVacancies, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Candidatos', value: totalCandidates, icon: Users, color: 'text-purple-600' },
    { label: 'Tasa conversión', value: totalCandidates > 0 ? Math.round((activeVacancies / Math.max(totalVacancies, 1)) * 100) + '%' : '0%', icon: TrendingUp, color: 'text-amber-600' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
