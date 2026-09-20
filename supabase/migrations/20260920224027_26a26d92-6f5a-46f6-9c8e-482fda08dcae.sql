REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (first_name, last_name, phone, birth_date, sex, height_cm, weight_kg, city, state, country, country_code, profession, company, job_title, bio, avatar_path, onboarding_completed_at) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.set_student_plan(_student_id uuid, _plan public.plan_code)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private
AS $$
BEGIN
  IF NOT app_private.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.profiles SET plan = _plan WHERE id = _student_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Student not found'; END IF;
  INSERT INTO public.crm_events(user_id, event_type, metadata)
  VALUES (_student_id, 'plan.changed', jsonb_build_object('plan', _plan, 'changed_by', auth.uid()));
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_student_plan(uuid, public.plan_code) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_student_plan(uuid, public.plan_code) TO service_role;

CREATE OR REPLACE FUNCTION app_private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles(id, first_name, last_name)
  VALUES(new.id, coalesce(new.raw_user_meta_data->>'first_name',''), coalesce(new.raw_user_meta_data->>'last_name',''));
  INSERT INTO public.user_roles(user_id, role) VALUES(new.id, 'student');
  INSERT INTO public.crm_events(user_id, event_type, metadata) VALUES(new.id, 'user.created', '{}'::jsonb);
  RETURN new;
END;
$$;