CREATE TABLE public.radar_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  email text NOT NULL,
  age integer NOT NULL CHECK (age BETWEEN 18 AND 100),
  job_title text NOT NULL,
  company text NOT NULL,
  segment text NOT NULL,
  commercial_status text NOT NULL DEFAULT 'RADAR_STARTED' CHECK (commercial_status IN ('NEW','RADAR_STARTED','RADAR_COMPLETED','WHATSAPP_CLICKED','QUALIFIED','OPPORTUNITY','CLIENT','DISQUALIFIED')),
  operational_status text NOT NULL DEFAULT 'RADAR_STARTED' CHECK (operational_status IN ('RADAR_STARTED','RADAR_IN_PROGRESS','RADAR_ABANDONED','RADAR_COMPLETED','ANALYSIS_PROCESSING','ANALYSIS_FAILED','REPORT_PROCESSING','REPORT_FAILED','RESULT_READY')),
  source text NOT NULL DEFAULT 'direct',
  questions_answered integer NOT NULL DEFAULT 0,
  completion_percentage integer NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  consent_at timestamptz NOT NULL,
  consent_version text NOT NULL DEFAULT '1.0',
  converted_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.radar_leads TO authenticated;
GRANT ALL ON public.radar_leads TO service_role;
ALTER TABLE public.radar_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_leads_staff_all ON public.radar_leads FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.radar_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.radar_leads(id) ON DELETE CASCADE,
  radar_version text NOT NULL DEFAULT '1.0',
  session_secret_hash text NOT NULL,
  result_token_hash text NOT NULL UNIQUE,
  current_question integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.radar_sessions TO authenticated;
GRANT ALL ON public.radar_sessions TO service_role;
ALTER TABLE public.radar_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_sessions_staff_all ON public.radar_sessions FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.radar_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  radar_version text NOT NULL,
  question_key text NOT NULL,
  pillar text NOT NULL CHECK (pillar IN ('construction','capacity','governance','perception','execution')),
  position integer NOT NULL,
  prompt text NOT NULL,
  low_label text NOT NULL,
  high_label text NOT NULL,
  reverse_scored boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(radar_version, question_key),
  UNIQUE(radar_version, position)
);
GRANT SELECT ON public.radar_questions TO authenticated;
GRANT ALL ON public.radar_questions TO service_role;
ALTER TABLE public.radar_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_questions_staff_read ON public.radar_questions FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));

CREATE TABLE public.radar_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.radar_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.radar_questions(id) ON DELETE RESTRICT,
  answer_value integer NOT NULL CHECK (answer_value BETWEEN 1 AND 5),
  answered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.radar_answers TO authenticated;
GRANT ALL ON public.radar_answers TO service_role;
ALTER TABLE public.radar_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_answers_staff_all ON public.radar_answers FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.radar_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.radar_sessions(id) ON DELETE CASCADE,
  score_version text NOT NULL DEFAULT '1.0',
  construction_score integer NOT NULL CHECK (construction_score BETWEEN 0 AND 100),
  capacity_score integer NOT NULL CHECK (capacity_score BETWEEN 0 AND 100),
  governance_score integer NOT NULL CHECK (governance_score BETWEEN 0 AND 100),
  perception_score integer NOT NULL CHECK (perception_score BETWEEN 0 AND 100),
  execution_score integer NOT NULL CHECK (execution_score BETWEEN 0 AND 100),
  sim_performance_score integer NOT NULL CHECK (sim_performance_score BETWEEN 0 AND 100),
  strongest_pillar text NOT NULL,
  weakest_pillar text NOT NULL,
  raw_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.radar_scores TO authenticated;
GRANT ALL ON public.radar_scores TO service_role;
ALTER TABLE public.radar_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_scores_staff_all ON public.radar_scores FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.radar_ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.radar_sessions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','completed','failed')),
  executive_summary text,
  current_state text,
  primary_strength jsonb,
  primary_bottleneck jsonb,
  main_incoherence text,
  construction_analysis text,
  capacity_analysis text,
  governance_analysis text,
  perception_analysis text,
  execution_analysis text,
  priority text,
  next_movement text,
  closing_statement text,
  model text NOT NULL,
  model_version text NOT NULL,
  prompt_version text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  error_message text,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.radar_ai_analyses TO authenticated;
GRANT ALL ON public.radar_ai_analyses TO service_role;
ALTER TABLE public.radar_ai_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_ai_analyses_staff_all ON public.radar_ai_analyses FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.radar_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.radar_sessions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','ready','failed')),
  storage_path text,
  radar_version text NOT NULL,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.radar_reports TO authenticated;
GRANT ALL ON public.radar_reports TO service_role;
ALTER TABLE public.radar_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_reports_staff_all ON public.radar_reports FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.radar_leads(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.radar_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  source text NOT NULL DEFAULT 'radar',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lead_events TO authenticated;
GRANT ALL ON public.lead_events TO service_role;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_events_staff_read ON public.lead_events FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY lead_events_staff_insert ON public.lead_events FOR INSERT TO authenticated WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.lead_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.radar_leads(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lead_status_history TO authenticated;
GRANT ALL ON public.lead_status_history TO service_role;
ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_status_staff_read ON public.lead_status_history FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY lead_status_staff_insert ON public.lead_status_history FOR INSERT TO authenticated WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.utm_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.radar_leads(id) ON DELETE CASCADE,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_page text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.utm_attribution TO authenticated;
GRANT ALL ON public.utm_attribution TO service_role;
ALTER TABLE public.utm_attribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY utm_attribution_staff_all ON public.utm_attribution FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.radar_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  campaign_active boolean NOT NULL DEFAULT true,
  whatsapp_group_url text NOT NULL DEFAULT 'https://chat.whatsapp.com/BNk2t6YT4XhCpHXh4R7ED6',
  video_url text,
  active_version text NOT NULL DEFAULT '1.0',
  cta_text text NOT NULL DEFAULT 'ENTRAR NO GRUPO PRIVADO',
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.radar_settings TO authenticated;
GRANT ALL ON public.radar_settings TO service_role;
ALTER TABLE public.radar_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_settings_staff_read ON public.radar_settings FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY radar_settings_master_write ON public.radar_settings FOR ALL TO authenticated USING (app_private.has_role(auth.uid(),'admin_master')) WITH CHECK (app_private.has_role(auth.uid(),'admin_master'));

CREATE INDEX radar_leads_status_activity_idx ON public.radar_leads(commercial_status, last_activity_at DESC);
CREATE INDEX radar_leads_email_idx ON public.radar_leads(lower(email));
CREATE INDEX radar_sessions_lead_idx ON public.radar_sessions(lead_id, created_at DESC);
CREATE INDEX radar_answers_session_idx ON public.radar_answers(session_id);
CREATE INDEX lead_events_lead_created_idx ON public.lead_events(lead_id, created_at DESC);

CREATE TRIGGER radar_leads_updated BEFORE UPDATE ON public.radar_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER radar_sessions_updated BEFORE UPDATE ON public.radar_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER radar_questions_updated BEFORE UPDATE ON public.radar_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER radar_answers_updated BEFORE UPDATE ON public.radar_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER radar_ai_analyses_updated BEFORE UPDATE ON public.radar_ai_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER radar_reports_updated BEFORE UPDATE ON public.radar_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER radar_settings_updated BEFORE UPDATE ON public.radar_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.radar_settings(id) VALUES(true);
INSERT INTO public.radar_questions(radar_version,question_key,pillar,position,prompt,low_label,high_label,reverse_scored) VALUES
('1.0','construction_1','construction',1,'Quanto seu físico atual representa o físico que você deseja construir?','Ainda não representa','Representa plenamente',false),
('1.0','construction_2','construction',2,'Como você avalia sua evolução física nos últimos meses?','Sem evolução','Evolução consistente',false),
('1.0','construction_3','construction',3,'Qual é seu nível atual de consistência com treinamento?','Muito baixo','Muito alto',false),
('1.0','capacity_1','capacity',4,'Como você avalia a qualidade do seu sono?','Muito baixa','Excelente',false),
('1.0','capacity_2','capacity',5,'Como você avalia sua energia durante o horário de trabalho?','Muito baixa','Excelente',false),
('1.0','capacity_3','capacity',6,'Quanto dores ou desconfortos corporais interferem na sua rotina?','Não interferem','Interferem muito',true),
('1.0','governance_1','governance',7,'Quanto controle você sente que possui sobre sua própria agenda?','Pouco controle','Controle completo',false),
('1.0','governance_2','governance',8,'Quão consistente é sua rotina de alimentação e hidratação?','Inconsistente','Muito consistente',false),
('1.0','governance_3','governance',9,'Com que frequência você cumpre os compromissos que estabelece consigo mesmo?','Raramente','Sempre',false),
('1.0','perception_1','perception',10,'Quanto sua postura transmite a confiança que você deseja comunicar?','Pouco','Plenamente',false),
('1.0','perception_2','perception',11,'Quanto sua imagem atual representa o nível profissional que você alcançou?','Pouco','Plenamente',false),
('1.0','perception_3','perception',12,'Quão confiante você se sente ao entrar em ambientes importantes?','Pouco confiante','Muito confiante',false),
('1.0','execution_1','execution',13,'Quanto daquilo que você planeja você realmente executa?','Muito pouco','Quase tudo',false),
('1.0','execution_2','execution',14,'Qual sua capacidade de agir mesmo quando não está motivado?','Muito baixa','Muito alta',false),
('1.0','execution_3','execution',15,'Como você avalia sua consistência nos últimos 30 dias?','Muito baixa','Muito alta',false);