ALTER TYPE public.training_generation_status ADD VALUE IF NOT EXISTS 'NEEDS_LIBRARY' AFTER 'GENERATING';

ALTER TABLE public.training_generation_jobs
  ADD COLUMN IF NOT EXISTS error_code text,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz;

ALTER TABLE public.cycle_strategies
  ADD COLUMN IF NOT EXISTS ai_original jsonb,
  ADD COLUMN IF NOT EXISTS final_version jsonb,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE public.exercise_library
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS technique text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS video_storage_path text;

CREATE TYPE public.nutrition_generation_status AS ENUM ('WAITING_DATA','READY','GENERATING','DRAFT_READY','HUMAN_REVIEW','PUBLISHED','FAILED');

CREATE TABLE public.nutrition_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activation_id uuid REFERENCES public.client_activations(id) ON DELETE SET NULL,
  status public.nutrition_generation_status NOT NULL DEFAULT 'WAITING_DATA',
  trigger_source text NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  missing_prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
  readiness_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  last_attempt_at timestamptz,
  error_code text,
  error_message text,
  plan_id uuid REFERENCES public.nutrition_plans(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_generation_jobs TO authenticated;
GRANT ALL ON public.nutrition_generation_jobs TO service_role;
ALTER TABLE public.nutrition_generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY nutrition_generation_jobs_owner_read ON public.nutrition_generation_jobs FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY nutrition_generation_jobs_staff_read ON public.nutrition_generation_jobs FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY nutrition_generation_jobs_staff_write ON public.nutrition_generation_jobs FOR ALL TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','nutritionist','nutrition','specialist']::public.app_role[])) WITH CHECK (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','nutritionist','nutrition','specialist']::public.app_role[]));
CREATE TRIGGER nutrition_generation_jobs_updated BEFORE UPDATE ON public.nutrition_generation_jobs FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX nutrition_generation_jobs_queue_idx ON public.nutrition_generation_jobs(status,updated_at);
CREATE INDEX nutrition_generation_jobs_client_idx ON public.nutrition_generation_jobs(client_id,created_at DESC);
CREATE UNIQUE INDEX nutrition_generation_jobs_open_client_idx ON public.nutrition_generation_jobs(client_id) WHERE status IN ('WAITING_DATA','READY','GENERATING','DRAFT_READY','HUMAN_REVIEW');
CREATE TRIGGER audit_nutrition_generation_jobs AFTER INSERT OR UPDATE OR DELETE ON public.nutrition_generation_jobs FOR EACH ROW EXECUTE FUNCTION app_private.audit_activation_change();
ALTER PUBLICATION supabase_realtime ADD TABLE public.nutrition_generation_jobs;

CREATE TABLE public.client_operation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activation_id uuid REFERENCES public.client_activations(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('CLIENT','BRUNO','TEAM','SYSTEM')),
  summary text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.client_operation_events TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.client_operation_events TO authenticated;
GRANT ALL ON public.client_operation_events TO service_role;
ALTER TABLE public.client_operation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_operation_events_owner_read ON public.client_operation_events FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY client_operation_events_staff_read ON public.client_operation_events FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY client_operation_events_staff_write ON public.client_operation_events FOR ALL TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','coach','nutritionist','nutrition','relationship','specialist']::public.app_role[])) WITH CHECK (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','coach','nutritionist','nutrition','relationship','specialist']::public.app_role[]));
CREATE INDEX client_operation_events_timeline_idx ON public.client_operation_events(client_id,occurred_at DESC);

ALTER TABLE public.assessment_photos REPLICA IDENTITY FULL;