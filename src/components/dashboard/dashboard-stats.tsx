import { Card, CardContent } from '@/components/ui/card'
import { Users, Briefcase, TrendingUp } from 'lucide-react'

interface Props {
  totalCandidates: number
  activeVacancies: number
  inProcess: number
  hired: number
  prevCandidates: number
  prevActive: number
  prevInProcess: number
  prevHired: number
}

function getDelta(current: number, prev: number) {
  const diff = current - prev
  if (diff > 0) return { text: `↑ ${diff} vs. mes anterior`, color: 'text-green-600 dark:text-green-400' }
  if (diff < 0) return { text: `↓ ${Math.abs(diff)} vs. mes anterior`, color: 'text-red-500' }
  return { text: '— vs. mes anterior', color: 'text-gray-400' }
}

export function DashboardStats({
  totalCandidates, activeVacancies, inProcess, hired,
  prevCandidates, prevActive, prevInProcess, prevHired,
}: Props) {
  const stats = [
    { label: 'Candidatos', value: totalCandidates, icon: Users, iconBg: 'bg-blue-50 dark:bg-blue-950/40', iconColor: 'text-blue-600 dark:text-blue-400', delta: getDelta(totalCandidates, prevCandidates) },
    { label: 'Ofertas Activas', value: activeVacancies, icon: Briefcase, iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400', delta: getDelta(activeVacancies, prevActive) },
    { label: 'En Proceso', value: inProcess, icon: Users, iconBg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400', delta: getDelta(inProcess, prevInProcess) },
    { label: 'Contratados', value: hired, icon: TrendingUp, iconBg: 'bg-purple-50 dark:bg-purple-950/40', iconColor: 'text-purple-600 dark:text-purple-400', delta: getDelta(hired, prevHired) },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-gray-200 dark:border-gray-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className={`mt-2 text-xs ${stat.delta.color}`}>
              {stat.delta.text}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
