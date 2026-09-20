ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.onboarding_responses ADD CONSTRAINT onboarding_responses_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.sim_scores ADD CONSTRAINT sim_scores_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.daily_checkins ADD CONSTRAINT daily_checkins_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.weekly_reviews ADD CONSTRAINT weekly_reviews_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.workout_programs ADD CONSTRAINT workout_programs_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.workout_sessions ADD CONSTRAINT workout_sessions_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.protocols ADD CONSTRAINT protocols_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.crm_events ADD CONSTRAINT crm_events_profile_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.workout_programs ADD CONSTRAINT workout_programs_status_check CHECK (status IN ('draft','approved','published','archived'));
ALTER TABLE public.weekly_reviews ADD CONSTRAINT weekly_reviews_scales_check CHECK (
  (nutrition IS NULL OR nutrition BETWEEN 1 AND 5) AND
  (sleep IS NULL OR sleep BETWEEN 1 AND 5) AND
  (stress IS NULL OR stress BETWEEN 1 AND 5) AND
  (energy IS NULL OR energy BETWEEN 1 AND 5) AND
  (productivity IS NULL OR productivity BETWEEN 1 AND 5) AND
  (focus IS NULL OR focus BETWEEN 1 AND 5) AND
  (schedule_control IS NULL OR schedule_control BETWEEN 1 AND 5) AND
  (relationships IS NULL OR relationships BETWEEN 1 AND 5) AND
  (quality_time IS NULL OR quality_time BETWEEN 1 AND 5) AND
  (professional_performance IS NULL OR professional_performance BETWEEN 1 AND 5)
);

CREATE TABLE public.protocol_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.protocol_status NOT NULL,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.protocol_status_history TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.protocol_status_history TO authenticated;
GRANT ALL ON public.protocol_status_history TO service_role;
ALTER TABLE public.protocol_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY protocol_history_read ON public.protocol_status_history FOR SELECT TO authenticated USING (user_id = auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY protocol_history_staff_write ON public.protocol_status_history FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text NOT NULL CHECK (char_length(note) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notes TO authenticated;
GRANT ALL ON public.admin_notes TO service_role;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_notes_staff_access ON public.admin_notes FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()) AND author_id = auth.uid());
CREATE TRIGGER admin_notes_updated BEFORE UPDATE ON public.admin_notes FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();