ALTER TABLE public.photo_protocol_slots ADD COLUMN purpose text;
ALTER TABLE public.exercise_library ADD COLUMN equipment_options text[] NOT NULL DEFAULT '{}', ADD COLUMN common_errors_list text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.member_experiences ADD COLUMN capacity integer CHECK (capacity IS NULL OR capacity > 0);
ALTER TABLE public.experience_interests ADD COLUMN status text NOT NULL DEFAULT 'interested' CHECK (status IN ('interested','invited','confirmed','cancelled'));

CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 3000),
  image_path text,
  image_mime_type text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','archived','moderated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_posts_read ON public.community_posts FOR SELECT TO authenticated USING (status='published' OR user_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY community_posts_create ON public.community_posts FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND status='published');
CREATE POLICY community_posts_owner_update ON public.community_posts FOR UPDATE TO authenticated USING (user_id=auth.uid() OR app_private.is_staff(auth.uid())) WITH CHECK (user_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY community_posts_owner_delete ON public.community_posts FOR DELETE TO authenticated USING (user_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE TRIGGER community_posts_updated BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.community_likes (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(post_id,user_id)
);
GRANT SELECT, INSERT, DELETE ON public.community_likes TO authenticated;
GRANT ALL ON public.community_likes TO service_role;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_likes_read ON public.community_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY community_likes_create ON public.community_likes FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY community_likes_delete ON public.community_likes FOR DELETE TO authenticated USING (user_id=auth.uid() OR app_private.is_staff(auth.uid()));

CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 1000),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','archived','moderated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;
GRANT ALL ON public.community_comments TO service_role;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_comments_read ON public.community_comments FOR SELECT TO authenticated USING (status='published' OR user_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY community_comments_create ON public.community_comments FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND status='published');
CREATE POLICY community_comments_owner_update ON public.community_comments FOR UPDATE TO authenticated USING (user_id=auth.uid() OR app_private.is_staff(auth.uid())) WITH CHECK (user_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY community_comments_owner_delete ON public.community_comments FOR DELETE TO authenticated USING (user_id=auth.uid() OR app_private.is_staff(auth.uid()));
CREATE TRIGGER community_comments_updated BEFORE UPDATE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.community_saves (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(post_id,user_id)
);
GRANT SELECT, INSERT, DELETE ON public.community_saves TO authenticated;
GRANT ALL ON public.community_saves TO service_role;
ALTER TABLE public.community_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_saves_owner ON public.community_saves FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.food_log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  meal_name text NOT NULL,
  food_name text NOT NULL,
  quantity numeric,
  unit text,
  calories numeric CHECK (calories IS NULL OR calories >= 0),
  protein numeric CHECK (protein IS NULL OR protein >= 0),
  carbs numeric CHECK (carbs IS NULL OR carbs >= 0),
  fat numeric CHECK (fat IS NULL OR fat >= 0),
  source text NOT NULL DEFAULT 'MANUAL' CHECK (source IN ('MANUAL','SCAN_ESTIMATE')),
  estimate_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_log_entries TO authenticated;
GRANT ALL ON public.food_log_entries TO service_role;
ALTER TABLE public.food_log_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY food_log_read ON public.food_log_entries FOR SELECT TO authenticated USING (user_id=auth.uid() OR app_private.can_access_client(auth.uid(),user_id));
CREATE POLICY food_log_owner_create ON public.food_log_entries FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY food_log_owner_update ON public.food_log_entries FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY food_log_owner_delete ON public.food_log_entries FOR DELETE TO authenticated USING (user_id=auth.uid());
CREATE TRIGGER food_log_entries_updated BEFORE UPDATE ON public.food_log_entries FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.monthly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_start date NOT NULL,
  sim_score integer CHECK (sim_score BETWEEN 0 AND 100),
  energy integer NOT NULL CHECK (energy BETWEEN 1 AND 5),
  sleep integer NOT NULL CHECK (sleep BETWEEN 1 AND 5),
  stress integer NOT NULL CHECK (stress BETWEEN 1 AND 5),
  consistency integer NOT NULL CHECK (consistency BETWEEN 1 AND 5),
  confidence integer NOT NULL CHECK (confidence BETWEEN 1 AND 5),
  productivity integer NOT NULL CHECK (productivity BETWEEN 1 AND 5),
  schedule_control integer NOT NULL CHECK (schedule_control BETWEEN 1 AND 5),
  quality_time integer NOT NULL CHECK (quality_time BETWEEN 1 AND 5),
  professional_performance integer NOT NULL CHECK (professional_performance BETWEEN 1 AND 5),
  revenue numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id,month_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_reviews TO authenticated;
GRANT ALL ON public.monthly_reviews TO service_role;
ALTER TABLE public.monthly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY monthly_reviews_owner ON public.monthly_reviews FOR ALL TO authenticated USING (user_id=auth.uid() OR app_private.can_access_client(auth.uid(),user_id)) WITH CHECK (user_id=auth.uid());
CREATE TRIGGER monthly_reviews_updated BEFORE UPDATE ON public.monthly_reviews FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE INDEX community_posts_created_idx ON public.community_posts(created_at DESC) WHERE status='published';
CREATE INDEX community_comments_post_idx ON public.community_comments(post_id,created_at);
CREATE INDEX food_log_user_date_idx ON public.food_log_entries(user_id,logged_at DESC);
CREATE INDEX monthly_reviews_user_month_idx ON public.monthly_reviews(user_id,month_start DESC);

CREATE POLICY member_media_community_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='member-media' AND (storage.foldername(name))[1]='community' AND (storage.foldername(name))[2]=auth.uid()::text);
CREATE POLICY member_media_community_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='member-media' AND (storage.foldername(name))[1]='community');
CREATE POLICY member_media_community_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='member-media' AND (storage.foldername(name))[1]='community' AND ((storage.foldername(name))[2]=auth.uid()::text OR app_private.is_staff(auth.uid()))) WITH CHECK (bucket_id='member-media' AND (storage.foldername(name))[1]='community' AND ((storage.foldername(name))[2]=auth.uid()::text OR app_private.is_staff(auth.uid())));
CREATE POLICY member_media_community_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='member-media' AND (storage.foldername(name))[1]='community' AND ((storage.foldername(name))[2]=auth.uid()::text OR app_private.is_staff(auth.uid())));