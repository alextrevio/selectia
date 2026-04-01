'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NuevaEntrevistaModal } from './nueva-entrevista-modal'
import type { InterviewWithRelations, Vacancy, Candidate } from '@/types/database'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  Calendar as CalIcon,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Props {
  interviews: InterviewWithRelations[]
  vacancies: Pick<Vacancy, 'id' | 'title'>[]
  candidates: Pick<Candidate, 'id' | 'full_name' | 'vacancy_id'>[]
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  no_show: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistio',
}

const TYPE_ICONS: Record<string, typeof Phone> = {
  in_person: MapPin,
  video: Video,
  phone: Phone,
}

export function CalendarioClient({ interviews, vacancies, candidates }: Props) {
  const [view, setView] = useState<'month' | 'week' | 'list'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [vacancyFilter, setVacancyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(() => {
    return interviews.filter((i) => {
      const matchesVacancy = vacancyFilter === 'all' || i.vacancy_id === vacancyFilter
      const matchesType = typeFilter === 'all' || i.interview_type === typeFilter
      return matchesVacancy && matchesType
    })
  }, [interviews, vacancyFilter, typeFilter])

  const getInterviewsForDay = (date: Date) =>
    filtered.filter((i) => isSameDay(new Date(i.scheduled_at), date))

  // Navigation
  const goToday = () => setCurrentDate(new Date())
  const goPrev = () => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))
  const goNext = () => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))

  // Month view days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: calStart, end: calEnd })

  // Week view days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 08:00 to 19:00

  const renderInterviewCard = (interview: InterviewWithRelations) => {
    const TypeIcon = TYPE_ICONS[interview.interview_type] || CalIcon
    return (
      <Card key={interview.id} className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{interview.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(interview.scheduled_at), 'HH:mm')} · {interview.duration_minutes}min
                </span>
                {interview.candidate && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {interview.candidate.full_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  {interview.interview_type === 'in_person' ? 'Presencial' : interview.interview_type === 'video' ? 'Video' : 'Telefono'}
                </span>
                {interview.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {interview.location}
                  </span>
                )}
              </div>
              {interview.vacancy && (
                <p className="mt-1 text-[11px] text-muted-foreground">{interview.vacancy.title}</p>
              )}
            </div>
            <Badge className={cn('shrink-0 text-[10px]', STATUS_COLORS[interview.status])} variant="secondary">
              {STATUS_LABELS[interview.status] || interview.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendario</h1>
          <p className="text-muted-foreground">Gestion de entrevistas y eventos</p>
        </div>
        <NuevaEntrevistaModal vacancies={vacancies} candidates={candidates} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
            {(['month', 'week', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  view === v
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Lista'}
              </button>
            ))}
          </div>

          {/* Nav */}
          {view !== 'list' && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="ml-2 text-sm font-semibold capitalize">
                {view === 'month'
                  ? format(currentDate, 'MMMM yyyy', { locale: es })
                  : `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={vacancyFilter} onValueChange={(v: string | null) => setVacancyFilter(v ?? 'all')}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Todas las ofertas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ofertas</SelectItem>
              {vacancies.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v: string | null) => setTypeFilter(v ?? 'all')}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="in_person">Presencial</SelectItem>
              <SelectItem value="video">Videollamada</SelectItem>
              <SelectItem value="phone">Telefonica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900">
            {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const dayInterviews = getInterviewsForDay(day)
              const today = isToday(day)
              const inMonth = isSameMonth(day, currentDate)
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[80px] border-t border-r border-gray-100 dark:border-gray-800 p-1',
                    !inMonth && 'bg-gray-50/50 dark:bg-gray-900/30'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                      today && 'bg-blue-600 text-white font-semibold',
                      !today && !inMonth && 'text-gray-300 dark:text-gray-600',
                      !today && inMonth && 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayInterviews.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {dayInterviews.slice(0, 2).map((i) => (
                        <div
                          key={i.id}
                          className="truncate rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                        >
                          {format(new Date(i.scheduled_at), 'HH:mm')} {i.title}
                        </div>
                      ))}
                      {dayInterviews.length > 2 && (
                        <span className="text-[10px] text-muted-foreground px-1">
                          +{dayInterviews.length - 2} mas
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="grid grid-cols-8">
            <div className="border-r border-gray-100 dark:border-gray-800" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'border-r border-gray-100 dark:border-gray-800 p-2 text-center',
                  isToday(day) && 'bg-blue-50 dark:bg-blue-950/20'
                )}
              >
                <p className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: es })}</p>
                <p className={cn('text-sm font-semibold', isToday(day) && 'text-blue-600 dark:text-blue-400')}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-t border-gray-100 dark:border-gray-800">
              <div className="border-r border-gray-100 dark:border-gray-800 p-1 text-right text-[10px] text-muted-foreground pr-2">
                {`${hour}:00`}
              </div>
              {weekDays.map((day) => {
                const hourInterviews = filtered.filter((i) => {
                  const d = new Date(i.scheduled_at)
                  return isSameDay(d, day) && d.getHours() === hour
                })
                return (
                  <div
                    key={day.toISOString()}
                    className="border-r border-gray-100 dark:border-gray-800 min-h-[48px] p-0.5"
                  >
                    {hourInterviews.map((i) => (
                      <div
                        key={i.id}
                        className="rounded bg-blue-500 px-1.5 py-1 text-[10px] text-white font-medium truncate"
                      >
                        {i.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <CalIcon className="h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No hay entrevistas</p>
              <p className="text-xs text-muted-foreground">Programa una entrevista para comenzar</p>
            </div>
          ) : (
            filtered.map(renderInterviewCard)
          )}
        </div>
      )}
    </div>
  )
}
