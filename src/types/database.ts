export type UserRole = 'owner' | 'admin' | 'recruiter' | 'viewer'
export type VacancyStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived'
export type CandidateStage = 'new' | 'screening' | 'qualified' | 'interview' | 'offer' | 'hired' | 'rejected'
export type MessageRole = 'candidate' | 'agent' | 'human'
export type ConversationStatus = 'active' | 'waiting_human' | 'completed' | 'expired'
export type QuestionType = 'text' | 'yes_no' | 'multiple_choice' | 'numeric' | 'location'
export type InterviewStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  plan: string
  max_vacancies: number
  max_candidates_per_month: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  org_id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  last_login: string | null
  created_at: string
}

export interface Vacancy {
  id: string
  org_id: string
  created_by: string | null
  title: string
  description: string | null
  requirements: string | null
  location: string | null
  department: string | null
  modality: string
  level: string | null
  salary_min: number | null
  salary_max: number | null
  salary_period: string
  employment_type: string
  positions_available: number
  status: VacancyStatus
  vacancy_code: string
  agent_system_prompt: string | null
  agent_greeting: string | null
  agent_tone: string
  auto_reject_below: number
  escalate_to_human_above: number
  total_candidates: number
  qualified_candidates: number
  hired_count: number
  published_at: string | null
  closes_at: string | null
  created_at: string
  updated_at: string
}

export interface KillerQuestion {
  id: string
  vacancy_id: string
  question_text: string
  question_type: QuestionType
  options: Record<string, unknown> | null
  expected_answer: string | null
  weight: number
  is_eliminatory: boolean
  sort_order: number
  created_at: string
}

export interface Candidate {
  id: string
  org_id: string
  vacancy_id: string | null
  full_name: string | null
  phone: string | null
  email: string | null
  age: number | null
  location: string | null
  skills: string[]
  experience_summary: string | null
  score: number
  score_breakdown: Record<string, unknown> | null
  stage: CandidateStage
  stage_changed_at: string
  source: string
  is_starred: boolean
  rejection_reason: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  org_id: string
  candidate_id: string
  vacancy_id: string | null
  whatsapp_chat_id: string | null
  status: ConversationStatus
  questions_asked: number
  questions_total: number
  current_question_index: number
  ai_summary: string | null
  ai_recommendation: string | null
  last_message_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  whatsapp_message_id: string | null
  is_killer_question: boolean
  killer_question_id: string | null
  candidate_answer_score: number | null
  created_at: string
}

export interface Interview {
  id: string
  org_id: string
  candidate_id: string
  vacancy_id: string | null
  scheduled_by: string | null
  title: string
  interview_type: string
  scheduled_at: string
  duration_minutes: number
  location: string | null
  meeting_url: string | null
  notes: string | null
  status: InterviewStatus
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  org_id: string
  candidate_id: string
  user_id: string | null
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

// Extended types with relations
export interface CandidateWithVacancy extends Candidate {
  vacancy: Pick<Vacancy, 'id' | 'title'> | null
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
  candidate: Pick<Candidate, 'id' | 'full_name' | 'phone'> | null
}

export interface VacancyWithCandidates extends Vacancy {
  candidates: Candidate[]
  killer_questions: KillerQuestion[]
}

export interface InterviewWithRelations extends Interview {
  candidate: Pick<Candidate, 'id' | 'full_name' | 'phone'> | null
  vacancy: Pick<Vacancy, 'id' | 'title'> | null
}
