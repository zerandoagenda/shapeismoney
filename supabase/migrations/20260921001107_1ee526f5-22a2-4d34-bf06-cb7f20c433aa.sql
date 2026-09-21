CREATE OR REPLACE FUNCTION app_private.is_beta_full_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('beta_member','admin_master')) $$;
REVOKE ALL ON FUNCTION app_private.is_beta_full_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.is_beta_full_access(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.current_user_has_entitlement(_feature_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,app_private AS $$
 SELECT app_private.is_beta_full_access(auth.uid()) OR EXISTS (
  SELECT 1 FROM public.profiles p JOIN public.plan_entitlements e ON e.plan=p.plan
  WHERE p.id=auth.uid() AND e.feature_key=_feature_key AND e.enabled
 )
$$;
CREATE OR REPLACE FUNCTION app_private.current_plan_meets(_minimum public.plan_code)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,app_private AS $$
 SELECT app_private.is_beta_full_access(auth.uid()) OR EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND app_private.plan_rank(p.plan)>=app_private.plan_rank(_minimum)
 )
$$;

INSERT INTO public.user_roles(user_id,role)
SELECT DISTINCT ur.user_id,'beta_member'::public.app_role FROM public.user_roles ur
WHERE ur.role='student' AND NOT app_private.is_staff(ur.user_id)
ON CONFLICT(user_id,role) DO NOTHING;

GRANT INSERT, DELETE ON public.user_roles TO authenticated;
DROP POLICY IF EXISTS roles_admin_master_manage ON public.user_roles;
CREATE POLICY roles_admin_master_manage ON public.user_roles FOR ALL TO authenticated
USING (app_private.is_admin_master(auth.uid()))
WITH CHECK (app_private.is_admin_master(auth.uid()));

UPDATE public.relationship_sla_policies SET response_minutes=60 WHERE product_key='default' AND priority='CRITICAL';