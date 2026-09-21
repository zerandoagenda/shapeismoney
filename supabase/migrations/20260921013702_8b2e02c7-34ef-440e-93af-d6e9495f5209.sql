CREATE OR REPLACE FUNCTION app_private.activate_client_plan_transaction(_client_id uuid, _plan public.plan_code, _source text, _actor_id uuid, _payment_reference text DEFAULT NULL::text)
RETURNS TABLE(previous_plan public.plan_code, active_subscription_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_previous_plan public.plan_code;
  v_subscription_id uuid;
BEGIN
  IF NOT app_private.has_any_staff_role(_actor_id, ARRAY['admin_master'::public.app_role,'admin'::public.app_role,'manager'::public.app_role]) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _source NOT IN ('manual_admin','payment','migration','system') THEN
    RAISE EXCEPTION 'Invalid activation source';
  END IF;
  SELECT plan INTO v_previous_plan FROM public.profiles WHERE id = _client_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Client not found'; END IF;
  PERFORM set_config('app.plan_change_actor', _actor_id::text, true);
  UPDATE public.profiles SET plan = _plan WHERE id = _client_id;
  SELECT id INTO v_subscription_id FROM public.client_subscriptions WHERE user_id = _client_id AND status = 'active' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
  IF v_subscription_id IS NULL THEN
    INSERT INTO public.client_subscriptions (user_id, plan, previous_plan, status, tracking_source, updated_by, created_by, start_date)
    VALUES (_client_id, _plan, v_previous_plan, CASE WHEN _plan = 'free' THEN 'paused' ELSE 'active' END, _source, _actor_id, _actor_id, current_date)
    RETURNING id INTO v_subscription_id;
  ELSE
    UPDATE public.client_subscriptions
    SET plan = _plan, previous_plan = v_previous_plan, status = CASE WHEN _plan = 'free' THEN 'paused' ELSE 'active' END, tracking_source = _source, updated_by = _actor_id
    WHERE id = v_subscription_id;
  END IF;
  INSERT INTO public.crm_events (user_id, event_type, metadata)
  VALUES (_client_id, 'plan.activated', jsonb_build_object('from',v_previous_plan,'plan',_plan,'source',_source,'payment_reference',_payment_reference));
  RETURN QUERY SELECT v_previous_plan, v_subscription_id;
END;
$function$;

CREATE OR REPLACE FUNCTION app_private.protect_profile_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'app_private'
AS $function$
DECLARE
  v_actor_id uuid;
  v_delegated_actor text := current_setting('app.plan_change_actor', true);
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    IF v_delegated_actor IS NOT NULL AND v_delegated_actor <> '' THEN
      v_actor_id := v_delegated_actor::uuid;
    ELSE
      v_actor_id := auth.uid();
    END IF;
    IF NOT app_private.is_staff(v_actor_id) THEN
      RAISE EXCEPTION 'Only staff can change plans';
    END IF;
    INSERT INTO public.crm_events(user_id, event_type, metadata)
    VALUES (NEW.id, 'plan.changed', jsonb_build_object('from', OLD.plan, 'plan', NEW.plan, 'changed_by', v_actor_id));
  END IF;
  RETURN NEW;
END;
$function$;