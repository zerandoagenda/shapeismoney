ALTER TABLE public.exercise_library
  ADD COLUMN movement_pattern text,
  ADD COLUMN primary_muscles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN secondary_muscles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN difficulty text,
  ADD COLUMN stability_requirement text,
  ADD COLUMN mobility_requirement text,
  ADD COLUMN fatigue_cost text,
  ADD COLUMN joint_considerations text[] NOT NULL DEFAULT '{}',
  ADD COLUMN red_flags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN regressions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN progressions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN alternatives text[] NOT NULL DEFAULT '{}',
  ADD COLUMN execution_cues text[] NOT NULL DEFAULT '{}',
  ADD COLUMN aliases text[] NOT NULL DEFAULT '{}';

CREATE TABLE public.cycle_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  target_date date,
  visual_goal text,
  structural_goal text,
  capacity_goal text,
  behavior_goal text,
  priority_regions text[] NOT NULL DEFAULT '{}',
  maintenance_regions text[] NOT NULL DEFAULT '{}',
  limitations text[] NOT NULL DEFAULT '{}',
  weekly_frequency integer NOT NULL CHECK (weekly_frequency BETWEEN 1 AND 14),
  session_duration integer NOT NULL CHECK (session_duration BETWEEN 10 AND 240),
  minimum_week jsonb NOT NULL DEFAULT '{}',
  strategy_summary text NOT NULL DEFAULT '',
  success_metrics jsonb NOT NULL DEFAULT '[]',
  contingency_rules jsonb NOT NULL DEFAULT '[]',
  review_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','archived')),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cycle_strategies TO authenticated;
GRANT ALL ON public.cycle_strategies TO service_role;
ALTER TABLE public.cycle_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY cycle_read ON public.cycle_strategies FOR SELECT TO authenticated USING (client_id = auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY cycle_staff_write ON public.cycle_strategies FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()) AND created_by = auth.uid());
CREATE TRIGGER cycle_strategies_updated BEFORE UPDATE ON public.cycle_strategies FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.cycle_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.cycle_strategies(id) ON DELETE CASCADE,
  priority_type text NOT NULL CHECK (priority_type IN ('CONSTRUCTION','STRUCTURAL','CAPACITY','BEHAVIORAL','EXECUTION')),
  target text NOT NULL,
  reason text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '[]',
  confidence numeric(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cycle_priorities TO authenticated;
GRANT ALL ON public.cycle_priorities TO service_role;
ALTER TABLE public.cycle_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY priorities_read ON public.cycle_priorities FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.cycle_strategies c WHERE c.id=cycle_id AND (c.client_id=auth.uid() OR app_private.is_staff(auth.uid()))));
CREATE POLICY priorities_staff_write ON public.cycle_priorities FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

ALTER TABLE public.workout_programs
  ADD COLUMN cycle_id uuid REFERENCES public.cycle_strategies(id),
  ADD COLUMN creation_source text NOT NULL DEFAULT 'MANUAL' CHECK (creation_source IN ('PDF_IMPORT','MANUAL','AI_DRAFT')),
  ADD COLUMN version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  ADD COLUMN parent_program_id uuid REFERENCES public.workout_programs(id),
  ADD COLUMN primary_goal text,
  ADD COLUMN why_this_plan text,
  ADD COLUMN approved_by uuid REFERENCES public.profiles(id),
  ADD COLUMN approved_at timestamptz,
  ADD COLUMN published_at timestamptz,
  ADD COLUMN rejected_at timestamptz;
UPDATE public.workout_programs SET approved_at=updated_at WHERE status IN ('approved','published') AND approved_at IS NULL;

ALTER TABLE public.workouts
  ADD COLUMN objective text,
  ADD COLUMN variant_type text NOT NULL DEFAULT 'STANDARD_SESSION' CHECK (variant_type IN ('MAIN_WORKOUT','HOME_OR_LIMITED_EQUIPMENT','TRAVEL_WORKOUT','EMERGENCY_20_MIN','OPTIONAL_30_MIN','OPTIONAL_40_MIN','STANDARD_SESSION'));

ALTER TABLE public.workout_exercises
  ADD COLUMN rep_min integer,
  ADD COLUMN rep_max integer,
  ADD COLUMN target_effort_type text NOT NULL DEFAULT 'RPE' CHECK (target_effort_type IN ('RPE','RIR')),
  ADD COLUMN target_effort numeric(3,1),
  ADD COLUMN tempo text,
  ADD COLUMN execution_notes text,
  ADD COLUMN substitution_group_id uuid,
  ADD COLUMN pain_rule text,
  ADD COLUMN video_reference text,
  ADD COLUMN reason_for_inclusion text,
  ADD COLUMN priority_relation text,
  ADD COLUMN evidence_relation jsonb NOT NULL DEFAULT '[]';

ALTER TABLE public.workout_sessions
  ADD COLUMN session_rpe numeric(3,1),
  ADD COLUMN session_pain integer CHECK (session_pain BETWEEN 0 AND 10),
  ADD COLUMN client_comment text,
  ADD COLUMN status text NOT NULL DEFAULT 'started' CHECK (status IN ('planned','started','completed','missed','cancelled'));

CREATE TABLE public.exercise_set_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  workout_exercise_id uuid NOT NULL REFERENCES public.workout_exercises(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  set_number integer NOT NULL CHECK (set_number > 0),
  load numeric,
  reps integer,
  effort numeric(3,1),
  effort_type text CHECK (effort_type IN ('RPE','RIR')),
  technique_ok boolean,
  pain integer CHECK (pain BETWEEN 0 AND 10),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id,workout_exercise_id,set_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_set_logs TO authenticated;
GRANT ALL ON public.exercise_set_logs TO service_role;
ALTER TABLE public.exercise_set_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY set_logs_owner ON public.exercise_set_logs FOR ALL TO authenticated USING (user_id=auth.uid() OR app_private.is_staff(auth.uid())) WITH CHECK (user_id=auth.uid() OR app_private.is_staff(auth.uid()));

CREATE TABLE public.training_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES public.cycle_strategies(id) ON DELETE SET NULL,
  program_id uuid REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  decision_date timestamptz NOT NULL DEFAULT now(),
  decision_type text NOT NULL,
  decision text NOT NULL,
  reason text NOT NULL,
  evidence_ids jsonb NOT NULL DEFAULT '[]',
  confidence numeric(4,3) CHECK (confidence BETWEEN 0 AND 1),
  author_type text NOT NULL CHECK (author_type IN ('AI','COACH','BRUNO')),
  author_id uuid REFERENCES public.profiles(id),
  approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected','superseded')),
  review_date date,
  supersedes_decision_id uuid REFERENCES public.training_decisions(id),
  ai_original jsonb,
  final_version jsonb,
  alteration text,
  alteration_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.training_decisions TO authenticated;
GRANT ALL ON public.training_decisions TO service_role;
ALTER TABLE public.training_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY decisions_read ON public.training_decisions FOR SELECT TO authenticated USING (client_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY decisions_staff_insert ON public.training_decisions FOR INSERT TO authenticated WITH CHECK (app_private.is_staff(auth.uid()) AND author_id=auth.uid());
CREATE POLICY decisions_staff_update ON public.training_decisions FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.training_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES public.cycle_strategies(id) ON DELETE SET NULL,
  program_id uuid REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  original_filename text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type='application/pdf'),
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','parsing','review','failed','saved')),
  extracted_text text,
  parsed_payload jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_imports TO authenticated;
GRANT ALL ON public.training_imports TO service_role;
ALTER TABLE public.training_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY imports_read ON public.training_imports FOR SELECT TO authenticated USING (client_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY imports_staff_write ON public.training_imports FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()) AND uploaded_by=auth.uid());
CREATE TRIGGER training_imports_updated BEFORE UPDATE ON public.training_imports FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.pain_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  workout_exercise_id uuid REFERENCES public.workout_exercises(id) ON DELETE SET NULL,
  location text NOT NULL,
  intensity integer NOT NULL CHECK (intensity BETWEEN 0 AND 10),
  onset text,
  provoking_movement text,
  radiation text,
  associated_symptoms text,
  history text,
  professional_followup text,
  classification text NOT NULL CHECK (classification IN ('GREEN','YELLOW','RED')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.pain_reports TO authenticated;
GRANT ALL ON public.pain_reports TO service_role;
ALTER TABLE public.pain_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY pain_read ON public.pain_reports FOR SELECT TO authenticated USING (user_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY pain_owner_insert ON public.pain_reports FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY pain_staff_update ON public.pain_reports FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

ALTER TABLE public.weekly_reviews
  ADD COLUMN sleep_hours numeric(3,1),
  ADD COLUMN pain integer CHECK (pain BETWEEN 0 AND 10),
  ADD COLUMN hydration integer CHECK (hydration BETWEEN 1 AND 5),
  ADD COLUMN weight_kg numeric,
  ADD COLUMN body_feeling text,
  ADD COLUMN cardio text,
  ADD COLUMN activity text,
  ADD COLUMN worked text,
  ADD COLUMN did_not_work text,
  ADD COLUMN next_obstacle text,
  ADD COLUMN travel text,
  ADD COLUMN event text,
  ADD COLUMN schedule_change text,
  ADD COLUMN free_text text,
  ADD COLUMN decision_classification text CHECK (decision_classification IN ('CONTINUE','MINOR_ADJUSTMENT','RECOVERY_ADJUSTMENT','TRAINING_REVIEW','HUMAN_REVIEW','REFERRAL')),
  ADD COLUMN attention_level text CHECK (attention_level IN ('GREEN','YELLOW','RED'));

CREATE TABLE public.photo_protocol_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_code text NOT NULL DEFAULT 'SIM_INITIAL_17',
  slot_number integer NOT NULL CHECK (slot_number BETWEEN 1 AND 17),
  pose_code text,
  public_name text,
  instruction_text text,
  reference_asset_url text,
  camera_orientation text,
  framing_rules text,
  required boolean NOT NULL DEFAULT true,
  analysis_tags text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(protocol_code,slot_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photo_protocol_slots TO authenticated;
GRANT ALL ON public.photo_protocol_slots TO service_role;
ALTER TABLE public.photo_protocol_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY photo_slots_read ON public.photo_protocol_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY photo_slots_staff_write ON public.photo_protocol_slots FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER photo_protocol_slots_updated BEFORE UPDATE ON public.photo_protocol_slots FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
INSERT INTO public.photo_protocol_slots(protocol_code,slot_number) SELECT 'SIM_INITIAL_17', generate_series(1,17);

CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES public.cycle_strategies(id) ON DELETE SET NULL,
  assessment_type text NOT NULL CHECK (assessment_type IN ('BASELINE','REASSESSMENT')),
  status text NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting','ready_for_review','approved','archived')),
  protocol_code text NOT NULL DEFAULT 'SIM_INITIAL_17',
  observations jsonb NOT NULL DEFAULT '{}',
  hypotheses jsonb NOT NULL DEFAULT '{}',
  previous_assessment_id uuid REFERENCES public.assessments(id),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessments_read ON public.assessments FOR SELECT TO authenticated USING (client_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY assessments_owner_create ON public.assessments FOR INSERT TO authenticated WITH CHECK (client_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY assessments_staff_update ON public.assessments FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER assessments_updated BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.assessment_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES public.photo_protocol_slots(id),
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  captured_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assessment_id,slot_id,version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_photos TO authenticated;
GRANT ALL ON public.assessment_photos TO service_role;
ALTER TABLE public.assessment_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_photos_owner ON public.assessment_photos FOR ALL TO authenticated USING (client_id=auth.uid() OR app_private.is_staff(auth.uid())) WITH CHECK (client_id=auth.uid() OR app_private.is_staff(auth.uid()));

CREATE TABLE public.technique_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id uuid REFERENCES public.workouts(id) ON DELETE SET NULL,
  exercise_id uuid REFERENCES public.exercise_library(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  status text NOT NULL DEFAULT 'HUMAN_REVIEW' CHECK (status IN ('KEEP','ADJUST','REDUCE_LOAD','CHANGE_EXECUTION','SUBSTITUTE','HUMAN_REVIEW')),
  observations text,
  cues text[] NOT NULL DEFAULT '{}',
  next_check date,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technique_videos TO authenticated;
GRANT ALL ON public.technique_videos TO service_role;
ALTER TABLE public.technique_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY technique_videos_read ON public.technique_videos FOR SELECT TO authenticated USING (client_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY technique_videos_owner_insert ON public.technique_videos FOR INSERT TO authenticated WITH CHECK (client_id=auth.uid());
CREATE POLICY technique_videos_owner_delete ON public.technique_videos FOR DELETE TO authenticated USING (client_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY technique_videos_staff_update ON public.technique_videos FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.training_knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('METHODOLOGY','RULE','EXAMPLE','PROGRAM','PROTOCOL','FAQ')),
  version text,
  content text NOT NULL,
  storage_path text,
  active boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_knowledge_documents TO authenticated;
GRANT ALL ON public.training_knowledge_documents TO service_role;
ALTER TABLE public.training_knowledge_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_kb_staff ON public.training_knowledge_documents FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER training_knowledge_updated BEFORE UPDATE ON public.training_knowledge_documents FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
INSERT INTO public.training_knowledge_documents(title,document_type,version,content,active,is_primary) VALUES ('SIM TRAINING INTELLIGENCE SPEC v1.0','METHODOLOGY','1.0','DADO → EVIDÊNCIA → INTERPRETAÇÃO → PRIORIDADE → DECISÃO → PRESCRIÇÃO → EXECUÇÃO → RESPOSTA → REAVALIAÇÃO. A decisão é a unidade central. Básico bem executado supera novidade; complexidade só entra quando melhora a solução. Execução é o centro operacional. Nenhuma saída pode diagnosticar patologia ou tomar decisão clínica.',true,true);

CREATE INDEX cycle_strategies_client_status_idx ON public.cycle_strategies(client_id,status,created_at DESC);
CREATE INDEX cycle_priorities_cycle_idx ON public.cycle_priorities(cycle_id,sort_order);
CREATE INDEX workout_programs_cycle_idx ON public.workout_programs(cycle_id,created_at DESC);
CREATE INDEX exercise_set_logs_user_created_idx ON public.exercise_set_logs(user_id,created_at DESC);
CREATE INDEX training_decisions_client_date_idx ON public.training_decisions(client_id,decision_date DESC);
CREATE INDEX training_imports_client_created_idx ON public.training_imports(client_id,created_at DESC);
CREATE INDEX pain_reports_user_status_idx ON public.pain_reports(user_id,status,created_at DESC);
CREATE INDEX assessments_client_created_idx ON public.assessments(client_id,created_at DESC);
CREATE INDEX technique_videos_client_created_idx ON public.technique_videos(client_id,created_at DESC);

CREATE OR REPLACE FUNCTION app_private.guard_training_publication() RETURNS trigger LANGUAGE plpgsql SET search_path=public,app_private AS $$
BEGIN
  IF NEW.status='published' AND (NEW.approved_at IS NULL OR NEW.approved_by IS NULL) THEN RAISE EXCEPTION 'Training must be approved before publication'; END IF;
  IF NEW.status='approved' AND NEW.approved_at IS NULL THEN NEW.approved_at=now(); NEW.approved_by=auth.uid(); END IF;
  IF NEW.status='published' AND NEW.published_at IS NULL THEN NEW.published_at=now(); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_training_publication BEFORE INSERT OR UPDATE ON public.workout_programs FOR EACH ROW EXECUTE FUNCTION app_private.guard_training_publication();

CREATE POLICY training_private_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='training-private' AND ((storage.foldername(name))[1]=auth.uid()::text OR app_private.is_staff(auth.uid())));
CREATE POLICY training_private_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='training-private' AND ((storage.foldername(name))[1]=auth.uid()::text OR app_private.is_staff(auth.uid())));
CREATE POLICY training_private_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='training-private' AND ((storage.foldername(name))[1]=auth.uid()::text OR app_private.is_staff(auth.uid()))) WITH CHECK (bucket_id='training-private' AND ((storage.foldername(name))[1]=auth.uid()::text OR app_private.is_staff(auth.uid())));
CREATE POLICY training_private_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='training-private' AND ((storage.foldername(name))[1]=auth.uid()::text OR app_private.is_staff(auth.uid())));