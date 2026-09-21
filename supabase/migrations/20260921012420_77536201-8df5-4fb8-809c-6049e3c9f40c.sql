CREATE OR REPLACE FUNCTION public.activate_client_plan_transaction(
  _client_id uuid,
  _plan public.plan_code,
  _source text,
  _actor_id uuid,
  _payment_reference text DEFAULT NULL
)
RETURNS TABLE(previous_plan public.plan_code, active_subscription_id uuid)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM app_private.activate_client_plan_transaction(_client_id,_plan,_source,_actor_id,_payment_reference)
$$;
REVOKE ALL ON FUNCTION public.activate_client_plan_transaction(uuid,public.plan_code,text,uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_client_plan_transaction(uuid,public.plan_code,text,uuid,text) TO service_role;