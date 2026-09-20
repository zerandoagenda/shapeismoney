DROP FUNCTION public.set_student_plan(uuid, public.plan_code);
GRANT UPDATE ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION app_private.protect_profile_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private
AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    IF NOT app_private.is_staff(auth.uid()) THEN
      RAISE EXCEPTION 'Only staff can change plans';
    END IF;
    INSERT INTO public.crm_events(user_id, event_type, metadata)
    VALUES (NEW.id, 'plan.changed', jsonb_build_object('from', OLD.plan, 'plan', NEW.plan, 'changed_by', auth.uid()));
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.protect_profile_plan() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.protect_profile_plan() TO service_role;

CREATE TRIGGER profiles_protect_plan
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION app_private.protect_profile_plan();