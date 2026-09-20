CREATE OR REPLACE FUNCTION app_private.is_admin_master(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin_master') $$;
CREATE OR REPLACE FUNCTION app_private.has_any_staff_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles)) $$;
GRANT EXECUTE ON FUNCTION app_private.is_admin_master(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_any_staff_role(uuid, public.app_role[]) TO authenticated;

CREATE TABLE public.client_subscriptions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 plan public.plan_code NOT NULL, subscription_value numeric(12,2), billing_cycle text CHECK (billing_cycle IN ('monthly','quarterly','semiannual','annual','one_time')),
 start_date date, renewal_date date, status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled','expired')),
 tracking_source text NOT NULL DEFAULT 'manual' CHECK (tracking_source = 'manual'), previous_plan public.plan_code,
 created_by uuid NOT NULL REFERENCES public.profiles(id), updated_by uuid NOT NULL REFERENCES public.profiles(id), cancelled_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_subscriptions TO authenticated; GRANT ALL ON public.client_subscriptions TO service_role;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_subscriptions_staff_read ON public.client_subscriptions FOR SELECT TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','analyst']::public.app_role[]));
CREATE POLICY client_subscriptions_admin_write ON public.client_subscriptions FOR ALL TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master']::public.app_role[])) WITH CHECK (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master']::public.app_role[]));
CREATE TRIGGER client_subscriptions_updated BEFORE UPDATE ON public.client_subscriptions FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX client_subscriptions_user_status_idx ON public.client_subscriptions(user_id,status,created_at DESC);

CREATE TABLE public.admin_tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 180), client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
 assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, created_by uuid NOT NULL REFERENCES public.profiles(id), due_date date,
 priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')), status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
 description text, completed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_tasks TO authenticated; GRANT ALL ON public.admin_tasks TO service_role;
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_tasks_staff_read ON public.admin_tasks FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR app_private.has_any_staff_role(auth.uid(), ARRAY['content','analyst']::public.app_role[]));
CREATE POLICY admin_tasks_staff_create ON public.admin_tasks FOR INSERT TO authenticated WITH CHECK ((app_private.is_staff(auth.uid()) OR app_private.has_any_staff_role(auth.uid(), ARRAY['content','analyst']::public.app_role[])) AND created_by = auth.uid());
CREATE POLICY admin_tasks_assignee_update ON public.admin_tasks FOR UPDATE TO authenticated USING (created_by = auth.uid() OR assignee_id = auth.uid() OR app_private.is_admin_master(auth.uid())) WITH CHECK (created_by = auth.uid() OR assignee_id = auth.uid() OR app_private.is_admin_master(auth.uid()));
CREATE POLICY admin_tasks_owner_delete ON public.admin_tasks FOR DELETE TO authenticated USING (created_by = auth.uid() OR app_private.is_admin_master(auth.uid()));
CREATE TRIGGER admin_tasks_updated BEFORE UPDATE ON public.admin_tasks FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE INDEX admin_tasks_due_status_idx ON public.admin_tasks(status,due_date); CREATE INDEX admin_tasks_client_idx ON public.admin_tasks(client_id,created_at DESC);

CREATE TABLE public.admin_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
 notification_type text NOT NULL, title text NOT NULL, message text NOT NULL, target_path text, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated; GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_notifications_owner_read ON public.admin_notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY admin_notifications_staff_create ON public.admin_notifications FOR INSERT TO authenticated WITH CHECK (app_private.is_staff(auth.uid()) OR app_private.has_any_staff_role(auth.uid(), ARRAY['content','analyst']::public.app_role[]));
CREATE POLICY admin_notifications_owner_update ON public.admin_notifications FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
CREATE POLICY admin_notifications_owner_delete ON public.admin_notifications FOR DELETE TO authenticated USING (recipient_id = auth.uid());
CREATE INDEX admin_notifications_recipient_idx ON public.admin_notifications(recipient_id,read_at,created_at DESC);

CREATE TABLE public.admin_audit_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid NOT NULL REFERENCES public.profiles(id), action text NOT NULL, entity_type text NOT NULL,
 entity_id uuid, client_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated; GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_audit_staff_read ON public.admin_audit_log FOR SELECT TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','analyst']::public.app_role[]));
CREATE POLICY admin_audit_staff_insert ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK ((app_private.is_staff(auth.uid()) OR app_private.has_any_staff_role(auth.uid(), ARRAY['content','analyst']::public.app_role[])) AND actor_id = auth.uid());
CREATE INDEX admin_audit_client_created_idx ON public.admin_audit_log(client_id,created_at DESC); CREATE INDEX admin_audit_actor_created_idx ON public.admin_audit_log(actor_id,created_at DESC);
CREATE OR REPLACE FUNCTION app_private.block_audit_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN RAISE EXCEPTION 'Audit records are immutable'; END $$;
CREATE TRIGGER admin_audit_immutable BEFORE UPDATE OR DELETE ON public.admin_audit_log FOR EACH ROW EXECUTE FUNCTION app_private.block_audit_mutation();

CREATE TABLE public.product_usage_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 module text NOT NULL CHECK (module IN ('dashboard','performance','training','nutrition','perception','members','sim_select','money_brain')),
 event_type text NOT NULL CHECK (event_type IN ('open','view','start','complete','click')), entity_id uuid, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, occurred_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT ON public.product_usage_events TO authenticated; GRANT ALL ON public.product_usage_events TO service_role;
ALTER TABLE public.product_usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_usage_owner_read ON public.product_usage_events FOR SELECT TO authenticated USING (user_id = auth.uid() OR app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master','analyst']::public.app_role[]));
CREATE POLICY product_usage_owner_insert ON public.product_usage_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE INDEX product_usage_module_time_idx ON public.product_usage_events(module,occurred_at DESC); CREATE INDEX product_usage_user_time_idx ON public.product_usage_events(user_id,occurred_at DESC);

CREATE TABLE public.client_assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 assignment_role text NOT NULL CHECK (assignment_role IN ('primary','coach','nutrition','support')), active boolean NOT NULL DEFAULT true,
 assigned_by uuid NOT NULL REFERENCES public.profiles(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(client_id,staff_id,assignment_role));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_assignments TO authenticated; GRANT ALL ON public.client_assignments TO service_role;
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_assignments_staff_read ON public.client_assignments FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR app_private.has_any_staff_role(auth.uid(), ARRAY['analyst']::public.app_role[]));
CREATE POLICY client_assignments_admin_write ON public.client_assignments FOR ALL TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master']::public.app_role[])) WITH CHECK (app_private.has_any_staff_role(auth.uid(), ARRAY['manager','admin','admin_master']::public.app_role[]));
CREATE INDEX client_assignments_client_idx ON public.client_assignments(client_id,active);

CREATE OR REPLACE FUNCTION app_private.audit_admin_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, app_private AS $$
DECLARE subject uuid; action_name text; entity uuid; BEGIN subject := COALESCE(NEW.user_id, OLD.user_id); entity := COALESCE(NEW.id, OLD.id); action_name := TG_TABLE_NAME || '.' || lower(TG_OP);
IF auth.uid() IS NOT NULL AND (app_private.is_staff(auth.uid()) OR app_private.has_any_staff_role(auth.uid(), ARRAY['content','analyst']::public.app_role[])) THEN
INSERT INTO public.admin_audit_log(actor_id,action,entity_type,entity_id,client_id,metadata) VALUES(auth.uid(),action_name,TG_TABLE_NAME,entity,subject,jsonb_build_object('operation',TG_OP)); END IF; RETURN COALESCE(NEW,OLD); END $$;
CREATE TRIGGER audit_protocols AFTER INSERT OR UPDATE OR DELETE ON public.protocols FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_change();
CREATE TRIGGER audit_workout_programs AFTER INSERT OR UPDATE OR DELETE ON public.workout_programs FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_change();
CREATE TRIGGER audit_nutrition_plans AFTER INSERT OR UPDATE OR DELETE ON public.nutrition_plans FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_change();
CREATE TRIGGER audit_client_subscriptions AFTER INSERT OR UPDATE OR DELETE ON public.client_subscriptions FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_change();

CREATE OR REPLACE FUNCTION app_private.audit_admin_content_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, app_private AS $$
BEGIN IF auth.uid() IS NOT NULL AND (app_private.is_staff(auth.uid()) OR app_private.has_any_staff_role(auth.uid(), ARRAY['content']::public.app_role[])) THEN
INSERT INTO public.admin_audit_log(actor_id,action,entity_type,entity_id,metadata) VALUES(auth.uid(),TG_TABLE_NAME || '.' || lower(TG_OP),TG_TABLE_NAME,COALESCE(NEW.id,OLD.id),jsonb_build_object('operation',TG_OP)); END IF; RETURN COALESCE(NEW,OLD); END $$;
CREATE TRIGGER audit_member_contents AFTER INSERT OR UPDATE OR DELETE ON public.member_contents FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_content_change();
CREATE TRIGGER audit_select_partners AFTER INSERT OR UPDATE OR DELETE ON public.select_partners FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_content_change();
CREATE TRIGGER audit_select_benefits AFTER INSERT OR UPDATE OR DELETE ON public.select_benefits FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_content_change();