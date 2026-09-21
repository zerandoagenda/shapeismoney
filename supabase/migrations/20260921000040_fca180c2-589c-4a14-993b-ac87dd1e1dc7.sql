CREATE OR REPLACE FUNCTION app_private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('coach','nutritionist','nutrition','support','manager','admin','admin_master','content','analyst','relationship','specialist')) $$;

CREATE OR REPLACE FUNCTION app_private.can_access_client(_actor uuid, _client uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$ SELECT _actor=_client OR app_private.is_admin_master(_actor) OR EXISTS (SELECT 1 FROM public.client_assignments WHERE client_id=_client AND staff_id=_actor AND active) $$;
GRANT EXECUTE ON FUNCTION app_private.can_access_client(uuid,uuid) TO authenticated, service_role;

CREATE TABLE public.client_relationships (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
 journey_phase text NOT NULL DEFAULT 'INVITED' CHECK (journey_phase IN ('INVITED','ONBOARDING','ACTIVATION','BUILDING','CONSISTENCY','IDENTITY','BELONGING','RENEWAL','PAUSED','CLOSED','REACTIVATION')),
 relationship_state text NOT NULL DEFAULT 'HABIT_LOST' CHECK (relationship_state IN ('HABIT_LOST','MENTAL_SABOTAGE','COMMITTED','AMBASSADOR')),
 attention_level text NOT NULL DEFAULT 'WATCH' CHECK (attention_level IN ('NORMAL','WATCH','INTERVENE','CRITICAL','OPPORTUNITY')),
 responsible_user uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 next_action text, next_action_due_at timestamptz, last_human_contact timestamptz, last_activity timestamptz, last_checkin timestamptz,
 protocol_status public.protocol_status, attention_reason text, current_commitment text,
 journey_evidence jsonb NOT NULL DEFAULT '[]'::jsonb, state_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
 confirmed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL, confirmed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_relationships TO authenticated;
GRANT ALL ON public.client_relationships TO service_role;
ALTER TABLE public.client_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_relationships_member_read ON public.client_relationships FOR SELECT TO authenticated USING (client_id=auth.uid());
CREATE POLICY client_relationships_staff_read ON public.client_relationships FOR SELECT TO authenticated USING (app_private.can_access_client(auth.uid(),client_id) OR app_private.is_staff(auth.uid()));
CREATE POLICY client_relationships_staff_write ON public.client_relationships FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(),client_id) OR app_private.is_admin_master(auth.uid())) WITH CHECK (app_private.can_access_client(auth.uid(),client_id) OR app_private.is_admin_master(auth.uid()));
CREATE TRIGGER client_relationships_updated BEFORE UPDATE ON public.client_relationships FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX client_relationships_attention_idx ON public.client_relationships(attention_level,next_action_due_at);
CREATE INDEX client_relationships_responsible_idx ON public.client_relationships(responsible_user,journey_phase);

CREATE TABLE public.relationship_evidence (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 evidence_type text NOT NULL CHECK (evidence_type IN ('OBJECTIVE_RECORD','REPEATED_PATTERN','CLIENT_REPORT','CONTEXT','INTERPRETATION')),
 fact text NOT NULL CHECK (char_length(fact) BETWEEN 1 AND 1000), source text NOT NULL, source_entity_id uuid,
 weight integer NOT NULL CHECK (weight BETWEEN 1 AND 5), observed_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL REFERENCES public.profiles(id), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_evidence TO authenticated;
GRANT ALL ON public.relationship_evidence TO service_role;
ALTER TABLE public.relationship_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationship_evidence_staff ON public.relationship_evidence FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_access_client(auth.uid(),client_id) AND created_by=auth.uid());
CREATE INDEX relationship_evidence_client_idx ON public.relationship_evidence(client_id,observed_at DESC);

CREATE TABLE public.relationship_hypotheses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 gap_type text NOT NULL CHECK (gap_type IN ('COHERENCE_GAP','CONSISTENCY_GAP','CONGRUENCE_GAP','SUFFICIENCY_GAP','STABILITY_GAP')),
 hypothesis text NOT NULL, confidence numeric(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1), evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
 status text NOT NULL DEFAULT 'SUGGESTED' CHECK (status IN ('SUGGESTED','ACCEPTED','EDITED','REJECTED')),
 is_predominant boolean NOT NULL DEFAULT false, reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL, reviewed_at timestamptz,
 created_by_type text NOT NULL DEFAULT 'SYSTEM' CHECK (created_by_type IN ('SYSTEM','AI','HUMAN')), created_by uuid REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_hypotheses TO authenticated;
GRANT ALL ON public.relationship_hypotheses TO service_role;
ALTER TABLE public.relationship_hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationship_hypotheses_staff ON public.relationship_hypotheses FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_access_client(auth.uid(),client_id));
CREATE TRIGGER relationship_hypotheses_updated BEFORE UPDATE ON public.relationship_hypotheses FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX relationship_hypotheses_client_idx ON public.relationship_hypotheses(client_id,status,is_predominant);

CREATE TABLE public.relationship_alerts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 owner_id uuid NOT NULL REFERENCES public.profiles(id), attention_level text NOT NULL CHECK (attention_level IN ('NORMAL','WATCH','INTERVENE','CRITICAL','OPPORTUNITY')),
 priority text NOT NULL CHECK (priority IN ('CRITICAL','HIGH','MEDIUM','ROUTINE')), due_at timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','DISMISSED')),
 reason text NOT NULL, source text NOT NULL, source_entity_id uuid, suggested_action text, resolved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_alerts TO authenticated;
GRANT ALL ON public.relationship_alerts TO service_role;
ALTER TABLE public.relationship_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationship_alerts_staff ON public.relationship_alerts FOR ALL TO authenticated USING (owner_id=auth.uid() OR app_private.can_access_client(auth.uid(),client_id) OR app_private.is_admin_master(auth.uid())) WITH CHECK (owner_id IS NOT NULL AND due_at IS NOT NULL AND (app_private.can_access_client(auth.uid(),client_id) OR app_private.is_admin_master(auth.uid())));
CREATE TRIGGER relationship_alerts_updated BEFORE UPDATE ON public.relationship_alerts FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX relationship_alerts_queue_idx ON public.relationship_alerts(status,priority,due_at);

CREATE TABLE public.relationship_interventions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 objective text NOT NULL CHECK (objective IN ('UNDERSTAND','RECOGNIZE','REORGANIZE','CONFRONT','MOBILIZE','ESCALATE')),
 channel text NOT NULL, evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb, journey_phase text NOT NULL, relationship_state text NOT NULL,
 predominant_gap text, attention_level text NOT NULL, recent_data jsonb NOT NULL DEFAULT '{}'::jsonb, last_commitment text,
 prisma_perceive text NOT NULL, prisma_recognize text NOT NULL, prisma_interpret text NOT NULL, prisma_simplify text NOT NULL, prisma_mobilize text NOT NULL, prisma_annotate text NOT NULL,
 possible_questions jsonb NOT NULL DEFAULT '[]'::jsonb, smallest_next_step text NOT NULL, review_date date NOT NULL,
 draft_message text, final_message text, status text NOT NULL DEFAULT 'AI_DRAFT' CHECK (status IN ('AI_DRAFT','HUMAN_REVIEW','APPROVED','EXECUTED','CANCELLED')),
 created_by uuid NOT NULL REFERENCES public.profiles(id), approved_by uuid REFERENCES public.profiles(id), approved_at timestamptz, executed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_interventions TO authenticated;
GRANT ALL ON public.relationship_interventions TO service_role;
ALTER TABLE public.relationship_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationship_interventions_staff ON public.relationship_interventions FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_access_client(auth.uid(),client_id) AND created_by=auth.uid());
CREATE TRIGGER relationship_interventions_updated BEFORE UPDATE ON public.relationship_interventions FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX relationship_interventions_client_idx ON public.relationship_interventions(client_id,status,created_at DESC);

CREATE TABLE public.relationship_commitments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 intervention_id uuid REFERENCES public.relationship_interventions(id) ON DELETE SET NULL, action text NOT NULL, dose_or_frequency text NOT NULL,
 deadline timestamptz NOT NULL, confirmation_criterion text NOT NULL, responsible_id uuid NOT NULL REFERENCES public.profiles(id), review_date date NOT NULL,
 status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CONFIRMED','COMPLETED','OVERDUE','CANCELLED')),
 client_shared boolean NOT NULL DEFAULT true, completed_at timestamptz, created_by uuid NOT NULL REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_commitments TO authenticated;
GRANT ALL ON public.relationship_commitments TO service_role;
ALTER TABLE public.relationship_commitments ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationship_commitments_member_read ON public.relationship_commitments FOR SELECT TO authenticated USING (client_id=auth.uid() AND client_shared);
CREATE POLICY relationship_commitments_staff ON public.relationship_commitments FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_access_client(auth.uid(),client_id));
CREATE TRIGGER relationship_commitments_updated BEFORE UPDATE ON public.relationship_commitments FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX relationship_commitments_due_idx ON public.relationship_commitments(status,deadline);

CREATE TABLE public.relationship_contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 contact_type text NOT NULL, channel text NOT NULL, objective text NOT NULL, facts text NOT NULL, context text, intervention_summary text,
 outcome text, next_action text, next_action_due_at timestamptz, responsible_id uuid NOT NULL REFERENCES public.profiles(id),
 status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','COMPLETED','CANCELLED')),
 contacted_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL REFERENCES public.profiles(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT completed_contact_has_continuity CHECK (status<>'COMPLETED' OR NULLIF(trim(COALESCE(outcome,'')),'') IS NOT NULL OR (NULLIF(trim(COALESCE(next_action,'')),'') IS NOT NULL AND next_action_due_at IS NOT NULL)));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_contacts TO authenticated;
GRANT ALL ON public.relationship_contacts TO service_role;
ALTER TABLE public.relationship_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationship_contacts_staff ON public.relationship_contacts FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_access_client(auth.uid(),client_id) AND created_by=auth.uid());
CREATE TRIGGER relationship_contacts_updated BEFORE UPDATE ON public.relationship_contacts FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX relationship_contacts_client_idx ON public.relationship_contacts(client_id,contacted_at DESC);

CREATE TABLE public.client_milestones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 milestone_type text NOT NULL, title text NOT NULL, evidence text NOT NULL, recognized_by uuid NOT NULL REFERENCES public.profiles(id),
 client_shared boolean NOT NULL DEFAULT true, recognized_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_milestones TO authenticated;
GRANT ALL ON public.client_milestones TO service_role;
ALTER TABLE public.client_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_milestones_member_read ON public.client_milestones FOR SELECT TO authenticated USING (client_id=auth.uid() AND client_shared);
CREATE POLICY client_milestones_staff ON public.client_milestones FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_access_client(auth.uid(),client_id) AND recognized_by=auth.uid());
CREATE INDEX client_milestones_client_idx ON public.client_milestones(client_id,recognized_at DESC);

CREATE TABLE public.relationship_timeline (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 event_type text NOT NULL, title text NOT NULL, summary text NOT NULL, source text NOT NULL, source_entity_id uuid,
 visibility text NOT NULL DEFAULT 'TEAM' CHECK (visibility IN ('PRIVATE','TEAM','TECHNICAL','CLIENT_SHARED')),
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb, actor_id uuid REFERENCES public.profiles(id), occurred_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT ON public.relationship_timeline TO authenticated;
GRANT ALL ON public.relationship_timeline TO service_role;
ALTER TABLE public.relationship_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationship_timeline_member_read ON public.relationship_timeline FOR SELECT TO authenticated USING (client_id=auth.uid() AND visibility='CLIENT_SHARED');
CREATE POLICY relationship_timeline_staff_read ON public.relationship_timeline FOR SELECT TO authenticated USING (app_private.can_access_client(auth.uid(),client_id));
CREATE POLICY relationship_timeline_staff_insert ON public.relationship_timeline FOR INSERT TO authenticated WITH CHECK (app_private.can_access_client(auth.uid(),client_id) AND actor_id=auth.uid());
CREATE INDEX relationship_timeline_client_idx ON public.relationship_timeline(client_id,occurred_at DESC);

CREATE TABLE public.relationship_sla_policies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_key text NOT NULL, priority text NOT NULL CHECK (priority IN ('CRITICAL','HIGH','MEDIUM','ROUTINE')),
 response_minutes integer NOT NULL CHECK (response_minutes>0), active boolean NOT NULL DEFAULT true, updated_by uuid REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(product_key,priority));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_sla_policies TO authenticated;
GRANT ALL ON public.relationship_sla_policies TO service_role;
ALTER TABLE public.relationship_sla_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY relationship_sla_staff_read ON public.relationship_sla_policies FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY relationship_sla_admin_write ON public.relationship_sla_policies FOR ALL TO authenticated USING (app_private.is_admin_master(auth.uid())) WITH CHECK (app_private.is_admin_master(auth.uid()));
CREATE TRIGGER relationship_sla_updated BEFORE UPDATE ON public.relationship_sla_policies FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

ALTER TABLE public.admin_notes ADD COLUMN note_type text NOT NULL DEFAULT 'PRIVATE' CHECK (note_type IN ('PRIVATE','TEAM','TECHNICAL','CLIENT_SHARED'));
DROP POLICY IF EXISTS admin_notes_staff ON public.admin_notes;
DROP POLICY IF EXISTS admin_notes_staff_read ON public.admin_notes;
DROP POLICY IF EXISTS admin_notes_staff_write ON public.admin_notes;
CREATE POLICY admin_notes_member_shared_read ON public.admin_notes FOR SELECT TO authenticated USING (user_id=auth.uid() AND note_type='CLIENT_SHARED');
CREATE POLICY admin_notes_staff_read ON public.admin_notes FOR SELECT TO authenticated USING (app_private.can_access_client(auth.uid(),user_id));
CREATE POLICY admin_notes_staff_write ON public.admin_notes FOR ALL TO authenticated USING (app_private.can_access_client(auth.uid(),user_id)) WITH CHECK (app_private.can_access_client(auth.uid(),user_id) AND author_id=auth.uid());

CREATE OR REPLACE FUNCTION app_private.audit_relationship_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,app_private AS $$
DECLARE row_data jsonb:=to_jsonb(COALESCE(NEW,OLD)); subject uuid; entity uuid;
BEGIN subject:=(row_data->>'client_id')::uuid; entity:=(row_data->>'id')::uuid;
 IF auth.uid() IS NOT NULL AND app_private.is_staff(auth.uid()) THEN
  INSERT INTO public.admin_audit_log(actor_id,action,entity_type,entity_id,client_id,metadata)
  VALUES(auth.uid(),TG_TABLE_NAME||'.'||lower(TG_OP),TG_TABLE_NAME,entity,subject,jsonb_build_object('operation',TG_OP));
 END IF; RETURN COALESCE(NEW,OLD); END $$;
CREATE TRIGGER audit_client_relationships AFTER INSERT OR UPDATE OR DELETE ON public.client_relationships FOR EACH ROW EXECUTE FUNCTION app_private.audit_relationship_change();
CREATE TRIGGER audit_relationship_hypotheses AFTER INSERT OR UPDATE OR DELETE ON public.relationship_hypotheses FOR EACH ROW EXECUTE FUNCTION app_private.audit_relationship_change();
CREATE TRIGGER audit_relationship_alerts AFTER INSERT OR UPDATE OR DELETE ON public.relationship_alerts FOR EACH ROW EXECUTE FUNCTION app_private.audit_relationship_change();
CREATE TRIGGER audit_relationship_interventions AFTER INSERT OR UPDATE OR DELETE ON public.relationship_interventions FOR EACH ROW EXECUTE FUNCTION app_private.audit_relationship_change();
CREATE TRIGGER audit_relationship_commitments AFTER INSERT OR UPDATE OR DELETE ON public.relationship_commitments FOR EACH ROW EXECUTE FUNCTION app_private.audit_relationship_change();
CREATE TRIGGER audit_relationship_contacts AFTER INSERT OR UPDATE OR DELETE ON public.relationship_contacts FOR EACH ROW EXECUTE FUNCTION app_private.audit_relationship_change();
CREATE TRIGGER audit_client_milestones AFTER INSERT OR UPDATE OR DELETE ON public.client_milestones FOR EACH ROW EXECUTE FUNCTION app_private.audit_relationship_change();

INSERT INTO public.relationship_sla_policies(product_key,priority,response_minutes) VALUES
('default','CRITICAL',1),('default','HIGH',120),('default','MEDIUM',480),('default','ROUTINE',1440);