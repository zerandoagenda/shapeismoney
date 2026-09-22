CREATE TABLE public.client_anamnesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','completed','superseded')),
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'member' CHECK (source IN ('member','staff','onboarding_backfill')),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, version)
);
GRANT SELECT, INSERT, UPDATE ON public.client_anamnesis TO authenticated;
GRANT ALL ON public.client_anamnesis TO service_role;
ALTER TABLE public.client_anamnesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_anamnesis_read ON public.client_anamnesis FOR SELECT TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY client_anamnesis_owner_create ON public.client_anamnesis FOR INSERT TO authenticated WITH CHECK ((client_id = auth.uid() AND created_by = auth.uid()) OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY client_anamnesis_owner_update ON public.client_anamnesis FOR UPDATE TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id)) WITH CHECK (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE INDEX client_anamnesis_client_status_idx ON public.client_anamnesis(client_id,status,version DESC);

CREATE TABLE public.anamnesis_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anamnesis_id uuid NOT NULL REFERENCES public.client_anamnesis(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','blocked')),
  summary text,
  executive_context text,
  primary_objective text,
  limiting_factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  adherence_factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  recovery_factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_level text NOT NULL DEFAULT 'GREEN' CHECK (safety_level IN ('GREEN','YELLOW','RED')),
  safety_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_information jsonb NOT NULL DEFAULT '[]'::jsonb,
  readiness jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric,
  model text,
  model_version text,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(anamnesis_id)
);
GRANT SELECT ON public.anamnesis_analyses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.anamnesis_analyses TO authenticated;
GRANT ALL ON public.anamnesis_analyses TO service_role;
ALTER TABLE public.anamnesis_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY anamnesis_analyses_read ON public.anamnesis_analyses FOR SELECT TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY anamnesis_analyses_staff_write ON public.anamnesis_analyses FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(), client_id)) WITH CHECK (app_private.can_access_client(auth.uid(), client_id));
CREATE INDEX anamnesis_analyses_client_status_idx ON public.anamnesis_analyses(client_id,status,created_at DESC);

CREATE TABLE public.pillar_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score_id uuid REFERENCES public.sim_scores(id) ON DELETE SET NULL,
  anamnesis_analysis_id uuid REFERENCES public.anamnesis_analyses(id) ON DELETE SET NULL,
  pillar text NOT NULL CHECK (pillar IN ('construction','capacity','governance','perception','execution')),
  score integer CHECK (score BETWEEN 0 AND 100),
  components jsonb NOT NULL DEFAULT '[]'::jsonb,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  bottleneck text,
  advance text,
  next_action text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, score_id, pillar)
);
GRANT SELECT ON public.pillar_insights TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pillar_insights TO authenticated;
GRANT ALL ON public.pillar_insights TO service_role;
ALTER TABLE public.pillar_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY pillar_insights_read ON public.pillar_insights FOR SELECT TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY pillar_insights_staff_write ON public.pillar_insights FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(), client_id)) WITH CHECK (app_private.can_access_client(auth.uid(), client_id));
CREATE INDEX pillar_insights_client_idx ON public.pillar_insights(client_id,created_at DESC);

CREATE TABLE public.client_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  pillar text NOT NULL CHECK (pillar IN ('construction','capacity','governance','perception','execution')),
  target_frequency integer NOT NULL CHECK (target_frequency BETWEEN 1 AND 14),
  period text NOT NULL DEFAULT 'weekly' CHECK (period IN ('daily','weekly')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('recommended','active','paused','completed','ignored')),
  source text NOT NULL DEFAULT 'staff' CHECK (source IN ('staff','system','member')),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  starts_on date,
  ends_on date,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_habits TO authenticated;
GRANT ALL ON public.client_habits TO service_role;
ALTER TABLE public.client_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_habits_read ON public.client_habits FOR SELECT TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY client_habits_owner_update ON public.client_habits FOR UPDATE TO authenticated USING ((client_id = auth.uid() AND status IN ('active','paused','completed')) OR app_private.can_access_client(auth.uid(), client_id)) WITH CHECK (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY client_habits_staff_create ON public.client_habits FOR INSERT TO authenticated WITH CHECK (app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY client_habits_staff_delete ON public.client_habits FOR DELETE TO authenticated USING (app_private.can_access_client(auth.uid(), client_id));
CREATE INDEX client_habits_client_status_idx ON public.client_habits(client_id,status);

CREATE TABLE public.habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES public.client_habits(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(habit_id,log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_logs TO authenticated;
GRANT ALL ON public.habit_logs TO service_role;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY habit_logs_read ON public.habit_logs FOR SELECT TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY habit_logs_owner_write ON public.habit_logs FOR ALL TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id)) WITH CHECK (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE INDEX habit_logs_client_date_idx ON public.habit_logs(client_id,log_date DESC);

CREATE TABLE public.mindset_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  description text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  status text NOT NULL DEFAULT 'observed' CHECK (status IN ('observed','reviewed','dismissed')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mindset_signals TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mindset_signals TO authenticated;
GRANT ALL ON public.mindset_signals TO service_role;
ALTER TABLE public.mindset_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY mindset_signals_read ON public.mindset_signals FOR SELECT TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY mindset_signals_staff_write ON public.mindset_signals FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(), client_id)) WITH CHECK (app_private.can_access_client(auth.uid(), client_id));
CREATE INDEX mindset_signals_client_status_idx ON public.mindset_signals(client_id,status,created_at DESC);

CREATE TABLE public.contextual_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type text NOT NULL CHECK (context_type IN ('training','nutrition','habit','checkin','perception','general')),
  context_id uuid,
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','resolved')),
  parent_id uuid REFERENCES public.contextual_comments(id) ON DELETE CASCADE,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.contextual_comments TO authenticated;
GRANT ALL ON public.contextual_comments TO service_role;
ALTER TABLE public.contextual_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY contextual_comments_read ON public.contextual_comments FOR SELECT TO authenticated USING (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY contextual_comments_create ON public.contextual_comments FOR INSERT TO authenticated WITH CHECK ((client_id = auth.uid() AND author_id = auth.uid()) OR app_private.can_access_client(auth.uid(), client_id));
CREATE POLICY contextual_comments_update ON public.contextual_comments FOR UPDATE TO authenticated USING (author_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id)) WITH CHECK (client_id = auth.uid() OR app_private.can_access_client(auth.uid(), client_id));
CREATE INDEX contextual_comments_client_status_idx ON public.contextual_comments(client_id,status,created_at DESC);
CREATE INDEX contextual_comments_context_idx ON public.contextual_comments(context_type,context_id,created_at);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER client_anamnesis_updated_at BEFORE UPDATE ON public.client_anamnesis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER anamnesis_analyses_updated_at BEFORE UPDATE ON public.anamnesis_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER client_habits_updated_at BEFORE UPDATE ON public.client_habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER habit_logs_updated_at BEFORE UPDATE ON public.habit_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER mindset_signals_updated_at BEFORE UPDATE ON public.mindset_signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER contextual_comments_updated_at BEFORE UPDATE ON public.contextual_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.client_anamnesis(client_id,version,status,sections,source,created_by,completed_at)
SELECT o.user_id,1,'completed',o.responses,'onboarding_backfill',o.user_id,o.completed_at
FROM public.onboarding_responses o
WHERE o.completed_at IS NOT NULL
ON CONFLICT (client_id,version) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.client_anamnesis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anamnesis_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contextual_comments;