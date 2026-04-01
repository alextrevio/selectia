'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { InterviewWithRelations } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, MapPin, Video, User } from 'lucide-react'

interface Props {
  interviews: InterviewWithRelations[]
}

export function CalendarView({ interviews }: Props) {
  const grouped = interviews.reduce<Record<string, InterviewWithRelations[]>>((acc, interview) => {
    const date = format(new Date(interview.scheduled_at), 'yyyy-MM-dd')
    if (!acc[date]) acc[date] = []
    acc[date].push(interview)
    return acc
  }, {})

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, dayInterviews]) => (
          <div key={date}>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              {format(new Date(date), "EEEE, d 'de' MMMM", { locale: es })}
            </h3>
            <div className="space-y-2">
              {dayInterviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">
                          {format(new Date(interview.scheduled_at), 'HH:mm')}
                        </p>
                        <p className="text-xs text-muted-foreground">{interview.duration_minutes} min</p>
                      </div>
                      <div>
                        <p className="font-medium">{interview.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {interview.candidate && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" /> {interview.candidate.full_name}
                            </span>
                          )}
                          {interview.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {interview.location}
                            </span>
                          )}
                          {interview.meeting_url && (
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3" /> Videollamada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={statusColors[interview.status]} variant="secondary">
                      {interview.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      {interviews.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No hay entrevistas programadas</p>
      )}
    </div>
  )
}
