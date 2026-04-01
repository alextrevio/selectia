import type { CandidateStage, VacancyStatus } from '@/types/database'

export const STAGE_LABELS: Record<CandidateStage, string> = {
  new: 'Nuevo',
  screening: 'Screening',
  qualified: 'Calificado',
  interview: 'Entrevista',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado',
}

export const STAGE_COLORS: Record<CandidateStage, string> = {
  new: 'bg-gray-100 text-gray-800',
  screening: 'bg-blue-100 text-blue-800',
  qualified: 'bg-emerald-100 text-emerald-800',
  interview: 'bg-purple-100 text-purple-800',
  offer: 'bg-amber-100 text-amber-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export const PIPELINE_STAGES: CandidateStage[] = [
  'new',
  'screening',
  'qualified',
  'interview',
  'offer',
  'hired',
]

export const VACANCY_STATUS_LABELS: Record<VacancyStatus, string> = {
  draft: 'Borrador',
  active: 'Activa',
  paused: 'Pausada',
  closed: 'Cerrada',
  archived: 'Archivada',
}

export const MODALITY_OPTIONS = [
  { value: 'on_site', label: 'Presencial' },
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Híbrido' },
]

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Tiempo completo' },
  { value: 'part_time', label: 'Medio tiempo' },
  { value: 'contract', label: 'Contrato' },
  { value: 'internship', label: 'Prácticas' },
  { value: 'freelance', label: 'Freelance' },
]

export const LEVEL_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
]
