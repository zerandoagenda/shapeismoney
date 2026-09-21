CREATE OR REPLACE FUNCTION app_private.protect_profile_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'app_private'
AS $function$
DECLARE
  v_actor_id uuid := auth.uid();
  v_is_service_role boolean := coalesce(auth.role(), '') = 'service_role';
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    IF NOT v_is_service_role AND NOT app_private.is_staff(v_actor_id) THEN
      RAISE EXCEPTION 'Only staff can change plans';
    END IF;
    INSERT INTO public.crm_events(user_id, event_type, metadata)
    VALUES (NEW.id, 'plan.changed', jsonb_build_object('from', OLD.plan, 'plan', NEW.plan, 'changed_by', v_actor_id, 'service_role', v_is_service_role));
  END IF;
  RETURN NEW;
END;
$function$;