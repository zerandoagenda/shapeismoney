CREATE TYPE public.client_activation_status AS ENUM ('ACTIVE','BLOCKED','READY','COMPLETED','CANCELLED');
CREATE TYPE public.activation_stage AS ENUM ('PAYMENT_CONFIRMED','ONBOARDING_REQUIRED','BASELINE_REQUIRED','PHOTO_PROTOCOL_REQUIRED','ASSESSMENT_PROCESSING','ASSESSMENT_REVIEW','CYCLE_STRATEGY','TRAINING_GENERATION','TRAINING_REVIEW','NUTRITION_BUILD','FINAL_REVIEW','READY_TO_PUBLISH','ACTIVE_PROTOCOL');
CREATE TYPE public.training_generation_status AS ENUM ('WAITING_PREREQUISITES','READY','GENERATING','DRAFT_READY','HUMAN_REVIEW','APPROVED','PUBLISHED','FAILED');

CREATE TABLE public.client_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan public.plan_code NOT NULL,
  status public.client_activation_status NOT NULL DEFAULT 'ACTIVE',
  current_stage public.activation_stage NOT NULL DEFAULT 'PAYMENT_CONFIRMED',
  source text NOT NULL CHECK (source IN ('manual_admin','payment','migration','system')),
  payment_reference text,
  responsible_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  next_action text NOT NULL DEFAULT 'Confirmar acesso',
  next_action_owner text NOT NULL DEFAULT 'SYSTEM' CHECK (next_action_owner IN ('CLIENT','BRUNO','TEAM','SYSTEM')),
  stage_started_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz NOT NULL DEFAULT now(),
  target_delivery_at timestamptz NOT NULL,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_activations TO authenticated;
GRANT ALL ON public.client_activations TO service_role;
ALTER TABLE public.client_activations ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_activations_owner_read ON public.client_activations FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY client_activations_staff_read ON public.client_activations FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY client_activations_staff_write ON public.client_activations FOR ALL TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','coach','nutritionist','nutrition','relationship','specialist']::public.app_role[])) WITH CHECK (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','coach','nutritionist','nutrition','relationship','specialist']::public.app_role[]));
CREATE TRIGGER client_activations_updated BEFORE UPDATE ON public.client_activations FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX client_activations_queue_idx ON public.client_activations(status,current_stage,target_delivery_at);
CREATE INDEX client_activations_responsible_idx ON public.client_activations(responsible_id,status);

CREATE TABLE public.training_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activation_id uuid REFERENCES public.client_activations(id) ON DELETE SET NULL,
  cycle_id uuid REFERENCES public.cycle_strategies(id) ON DELETE SET NULL,
  status public.training_generation_status NOT NULL DEFAULT 'WAITING_PREREQUISITES',
  trigger_source text NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  missing_prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
  readiness_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  program_id uuid REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_generation_jobs TO authenticated;
GRANT ALL ON public.training_generation_jobs TO service_role;
ALTER TABLE public.training_generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_generation_jobs_owner_read ON public.training_generation_jobs FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY training_generation_jobs_staff_read ON public.training_generation_jobs FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY training_generation_jobs_staff_write ON public.training_generation_jobs FOR ALL TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','coach','specialist']::public.app_role[])) WITH CHECK (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','coach','specialist']::public.app_role[]));
CREATE TRIGGER training_generation_jobs_updated BEFORE UPDATE ON public.training_generation_jobs FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX training_generation_jobs_queue_idx ON public.training_generation_jobs(status,updated_at);
CREATE INDEX training_generation_jobs_client_idx ON public.training_generation_jobs(client_id,created_at DESC);
CREATE UNIQUE INDEX training_generation_jobs_open_client_idx ON public.training_generation_jobs(client_id) WHERE status IN ('WAITING_PREREQUISITES','READY','GENERATING','DRAFT_READY','HUMAN_REVIEW','APPROVED');

ALTER TABLE public.admin_tasks ADD COLUMN operation_key text;
CREATE UNIQUE INDEX admin_tasks_operation_key_idx ON public.admin_tasks(operation_key) WHERE operation_key IS NOT NULL AND status <> 'done';
ALTER TABLE public.admin_notifications ADD COLUMN operation_key text;
CREATE UNIQUE INDEX admin_notifications_operation_key_idx ON public.admin_notifications(recipient_id,operation_key) WHERE operation_key IS NOT NULL AND read_at IS NULL;

ALTER TABLE public.client_subscriptions DROP CONSTRAINT client_subscriptions_tracking_source_check;
ALTER TABLE public.client_subscriptions ADD CONSTRAINT client_subscriptions_tracking_source_check CHECK (tracking_source IN ('manual','manual_admin','payment','migration','system'));

UPDATE public.plan_entitlements SET enabled = true WHERE plan = 'paid' AND feature_key = 'can_access_perception_lab';
INSERT INTO public.plan_entitlements(plan,feature_key,enabled) VALUES
('paid','can_access_monthly_review',false),('plus','can_access_monthly_review',true),('premium','can_access_monthly_review',true),
('paid','can_access_technique_review',false),('plus','can_access_technique_review',true),('premium','can_access_technique_review',true),
('paid','can_access_travel_intelligence',false),('plus','can_access_travel_intelligence',true),('premium','can_access_travel_intelligence',true),
('premium','can_access_concierge',true)
ON CONFLICT(plan,feature_key) DO UPDATE SET enabled = EXCLUDED.enabled;

CREATE OR REPLACE FUNCTION app_private.audit_activation_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,app_private AS $$
DECLARE row_data jsonb:=to_jsonb(COALESCE(NEW,OLD)); subject uuid; entity uuid;
BEGIN subject:=(row_data->>'client_id')::uuid; entity:=(row_data->>'id')::uuid;
 IF auth.uid() IS NOT NULL AND app_private.is_staff(auth.uid()) THEN
  INSERT INTO public.admin_audit_log(actor_id,action,entity_type,entity_id,client_id,metadata)
  VALUES(auth.uid(),TG_TABLE_NAME||'.'||lower(TG_OP),TG_TABLE_NAME,entity,subject,jsonb_build_object('operation',TG_OP,'status',row_data->>'status'));
 END IF; RETURN COALESCE(NEW,OLD); END $$;
CREATE TRIGGER audit_client_activations AFTER INSERT OR UPDATE OR DELETE ON public.client_activations FOR EACH ROW EXECUTE FUNCTION app_private.audit_activation_change();
CREATE TRIGGER audit_training_generation_jobs AFTER INSERT OR UPDATE OR DELETE ON public.training_generation_jobs FOR EACH ROW EXECUTE FUNCTION app_private.audit_activation_change();

ALTER PUBLICATION supabase_realtime ADD TABLE public.client_activations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_generation_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_programs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nutrition_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.protocols;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;