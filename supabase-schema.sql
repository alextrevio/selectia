-- Selectia Database Schema
-- Run this in Supabase SQL Editor

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'recruiter', 'viewer');
CREATE TYPE vacancy_status AS ENUM ('draft', 'active', 'paused', 'closed', 'archived');
CREATE TYPE candidate_stage AS ENUM ('new', 'screening', 'qualified', 'interview', 'offer', 'hired', 'rejected');
CREATE TYPE message_role AS ENUM ('candidate', 'agent', 'human');
CREATE TYPE conversation_status AS ENUM ('active', 'waiting_human', 'completed', 'expired');
CREATE TYPE question_type AS ENUM ('text', 'yes_no', 'multiple_choice', 'numeric', 'location');
CREATE TYPE interview_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  plan TEXT DEFAULT 'free',
  max_vacancies INT DEFAULT 3,
  max_candidates_per_month INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'recruiter',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  location TEXT,
  department TEXT,
  modality TEXT DEFAULT 'on_site',
  level TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_period TEXT DEFAULT 'monthly',
  employment_type TEXT DEFAULT 'full_time',
  positions_available INT DEFAULT 1,
  status vacancy_status DEFAULT 'draft',
  vacancy_code TEXT UNIQUE DEFAULT 'VAC-' || substr(gen_random_uuid()::text, 1, 6),
  agent_system_prompt TEXT,
  agent_greeting TEXT,
  agent_tone TEXT DEFAULT 'professional',
  auto_reject_below INT DEFAULT 30,
  escalate_to_human_above INT DEFAULT 80,
  total_candidates INT DEFAULT 0,
  qualified_candidates INT DEFAULT 0,
  hired_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE killer_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id UUID REFERENCES vacancies(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type DEFAULT 'text',
  options JSONB,
  expected_answer TEXT,
  weight INT DEFAULT 10,
  is_eliminatory BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vacancy_id UUID REFERENCES vacancies(id) ON DELETE SET NULL,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  age INT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_summary TEXT,
  score INT DEFAULT 0,
  score_breakdown JSONB,
  stage candidate_stage DEFAULT 'new',
  stage_changed_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'whatsapp',
  is_starred BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, phone, vacancy_id)
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  vacancy_id UUID REFERENCES vacancies(id) ON DELETE SET NULL,
  whatsapp_chat_id TEXT,
  status conversation_status DEFAULT 'active',
  questions_asked INT DEFAULT 0,
  questions_total INT DEFAULT 0,
  current_question_index INT DEFAULT 0,
  ai_summary TEXT,
  ai_recommendation TEXT,
  last_message_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  whatsapp_message_id TEXT,
  is_killer_question BOOLEAN DEFAULT false,
  killer_question_id UUID REFERENCES killer_questions(id),
  candidate_answer_score INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  vacancy_id UUID REFERENCES vacancies(id) ON DELETE SET NULL,
  scheduled_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  interview_type TEXT DEFAULT 'in_person',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 30,
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  status interview_status DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_vacancies_org ON vacancies(org_id);
CREATE INDEX idx_vacancies_status ON vacancies(org_id, status);
CREATE INDEX idx_vacancies_code ON vacancies(vacancy_code);
CREATE INDEX idx_candidates_org ON candidates(org_id);
CREATE INDEX idx_candidates_vacancy ON candidates(vacancy_id);
CREATE INDEX idx_candidates_stage ON candidates(vacancy_id, stage);
CREATE INDEX idx_candidates_phone ON candidates(org_id, phone);
CREATE INDEX idx_conversations_candidate ON conversations(candidate_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_interviews_org ON interviews(org_id);
CREATE INDEX idx_interviews_date ON interviews(org_id, scheduled_at);
CREATE INDEX idx_activity_candidate ON activity_log(candidate_id);
CREATE INDEX idx_killer_questions_vacancy ON killer_questions(vacancy_id, sort_order);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE killer_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "org_access" ON organizations FOR ALL USING (id = get_user_org_id());
CREATE POLICY "org_access" ON users FOR ALL USING (org_id = get_user_org_id());
CREATE POLICY "org_access" ON vacancies FOR ALL USING (org_id = get_user_org_id());
CREATE POLICY "org_access" ON killer_questions FOR ALL USING (vacancy_id IN (SELECT id FROM vacancies WHERE org_id = get_user_org_id()));
CREATE POLICY "org_access" ON candidates FOR ALL USING (org_id = get_user_org_id());
CREATE POLICY "org_access" ON conversations FOR ALL USING (org_id = get_user_org_id());
CREATE POLICY "org_access" ON messages FOR ALL USING (conversation_id IN (SELECT id FROM conversations WHERE org_id = get_user_org_id()));
CREATE POLICY "org_access" ON interviews FOR ALL USING (org_id = get_user_org_id());
CREATE POLICY "org_access" ON activity_log FOR ALL USING (org_id = get_user_org_id());

-- Trigger: create user + org on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'org_name' IS NOT NULL THEN
    INSERT INTO public.organizations (name, slug)
    VALUES (
      NEW.raw_user_meta_data->>'org_name',
      lower(regexp_replace(NEW.raw_user_meta_data->>'org_name', '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 4)
    );
    INSERT INTO public.users (id, org_id, email, full_name, role)
    VALUES (
      NEW.id,
      (SELECT id FROM public.organizations ORDER BY created_at DESC LIMIT 1),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'owner'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Scoring functions
CREATE OR REPLACE FUNCTION update_candidate_score(p_candidate_id UUID)
RETURNS void AS $$
DECLARE v_total INT; v_earned NUMERIC; v_score INT;
BEGIN
  SELECT COALESCE(SUM(kq.weight), 0), COALESCE(SUM(CASE WHEN m.candidate_answer_score IS NOT NULL THEN (m.candidate_answer_score::NUMERIC / 10) * kq.weight ELSE 0 END), 0)
  INTO v_total, v_earned
  FROM conversations c JOIN messages m ON m.conversation_id = c.id AND m.is_killer_question = true JOIN killer_questions kq ON kq.id = m.killer_question_id
  WHERE c.candidate_id = p_candidate_id;
  v_score := CASE WHEN v_total > 0 THEN ROUND((v_earned / v_total) * 100) ELSE 0 END;
  UPDATE candidates SET score = v_score, updated_at = now() WHERE id = p_candidate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auto_advance_candidate(p_candidate_id UUID)
RETURNS void AS $$
DECLARE v_score INT; v_reject INT; v_escalate INT;
BEGIN
  SELECT c.score INTO v_score FROM candidates c WHERE c.id = p_candidate_id;
  SELECT auto_reject_below, escalate_to_human_above INTO v_reject, v_escalate FROM vacancies WHERE id = (SELECT vacancy_id FROM candidates WHERE id = p_candidate_id);
  IF v_score < v_reject THEN
    UPDATE candidates SET stage = 'rejected', rejection_reason = 'Score bajo (' || v_score || '/100)', updated_at = now() WHERE id = p_candidate_id;
  ELSIF v_score >= v_escalate THEN
    UPDATE candidates SET stage = 'qualified', updated_at = now() WHERE id = p_candidate_id;
  ELSE
    UPDATE candidates SET stage = 'screening', updated_at = now() WHERE id = p_candidate_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
