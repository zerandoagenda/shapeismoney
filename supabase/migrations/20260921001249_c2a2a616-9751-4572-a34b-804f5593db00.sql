CREATE OR REPLACE FUNCTION app_private.can_staff_access_client(_actor uuid,_client uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$ SELECT app_private.is_admin_master(_actor) OR EXISTS (SELECT 1 FROM public.client_assignments WHERE client_id=_client AND staff_id=_actor AND active) $$;
REVOKE ALL ON FUNCTION app_private.can_staff_access_client(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION app_private.can_staff_access_client(uuid,uuid) TO authenticated,service_role;

DROP POLICY IF EXISTS client_relationships_staff_read ON public.client_relationships;
DROP POLICY IF EXISTS client_relationships_staff_write ON public.client_relationships;
CREATE POLICY client_relationships_staff_read ON public.client_relationships FOR SELECT TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id));
CREATE POLICY client_relationships_staff_write ON public.client_relationships FOR ALL TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_staff_access_client(auth.uid(),client_id));

DROP POLICY IF EXISTS relationship_evidence_staff ON public.relationship_evidence;
CREATE POLICY relationship_evidence_staff ON public.relationship_evidence FOR ALL TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_staff_access_client(auth.uid(),client_id) AND created_by=auth.uid());
DROP POLICY IF EXISTS relationship_hypotheses_staff ON public.relationship_hypotheses;
CREATE POLICY relationship_hypotheses_staff ON public.relationship_hypotheses FOR ALL TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_staff_access_client(auth.uid(),client_id));
DROP POLICY IF EXISTS relationship_alerts_staff ON public.relationship_alerts;
CREATE POLICY relationship_alerts_staff ON public.relationship_alerts FOR ALL TO authenticated USING (owner_id=auth.uid() OR app_private.can_staff_access_client(auth.uid(),client_id)) WITH CHECK (owner_id IS NOT NULL AND due_at IS NOT NULL AND app_private.can_staff_access_client(auth.uid(),client_id));
DROP POLICY IF EXISTS relationship_interventions_staff ON public.relationship_interventions;
CREATE POLICY relationship_interventions_staff ON public.relationship_interventions FOR ALL TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_staff_access_client(auth.uid(),client_id) AND created_by=auth.uid());
DROP POLICY IF EXISTS relationship_commitments_staff ON public.relationship_commitments;
CREATE POLICY relationship_commitments_staff ON public.relationship_commitments FOR ALL TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_staff_access_client(auth.uid(),client_id));
CREATE POLICY relationship_commitments_member_confirm ON public.relationship_commitments FOR UPDATE TO authenticated USING (client_id=auth.uid() AND client_shared AND status='OPEN') WITH CHECK (client_id=auth.uid() AND client_shared AND status='CONFIRMED');
DROP POLICY IF EXISTS relationship_contacts_staff ON public.relationship_contacts;
CREATE POLICY relationship_contacts_staff ON public.relationship_contacts FOR ALL TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_staff_access_client(auth.uid(),client_id) AND created_by=auth.uid());
DROP POLICY IF EXISTS client_milestones_staff ON public.client_milestones;
CREATE POLICY client_milestones_staff ON public.client_milestones FOR ALL TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id)) WITH CHECK (app_private.can_staff_access_client(auth.uid(),client_id) AND recognized_by=auth.uid());
DROP POLICY IF EXISTS relationship_timeline_staff_read ON public.relationship_timeline;
DROP POLICY IF EXISTS relationship_timeline_staff_insert ON public.relationship_timeline;
CREATE POLICY relationship_timeline_staff_read ON public.relationship_timeline FOR SELECT TO authenticated USING (app_private.can_staff_access_client(auth.uid(),client_id));
CREATE POLICY relationship_timeline_staff_insert ON public.relationship_timeline FOR INSERT TO authenticated WITH CHECK (app_private.can_staff_access_client(auth.uid(),client_id) AND actor_id=auth.uid());

DROP POLICY IF EXISTS admin_notes_staff_read ON public.admin_notes;
DROP POLICY IF EXISTS admin_notes_staff_write ON public.admin_notes;
CREATE POLICY admin_notes_staff_read ON public.admin_notes FOR SELECT TO authenticated USING (app_private.can_staff_access_client(auth.uid(),user_id));
CREATE POLICY admin_notes_staff_write ON public.admin_notes FOR ALL TO authenticated USING (app_private.can_staff_access_client(auth.uid(),user_id)) WITH CHECK (app_private.can_staff_access_client(auth.uid(),user_id) AND author_id=auth.uid());