CREATE TYPE public.perception_scan_status AS ENUM ('processing','ai_completed','reviewed','failed');

CREATE OR REPLACE FUNCTION app_private.plan_rank(_plan public.plan_code)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _plan WHEN 'free' THEN 0 WHEN 'paid' THEN 1 WHEN 'plus' THEN 2 WHEN 'premium' THEN 3 ELSE -1 END
$$;
CREATE OR REPLACE FUNCTION app_private.current_user_has_entitlement(_feature_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app_private AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.plan_entitlements e ON e.plan = p.plan
    WHERE p.id = auth.uid() AND e.feature_key = _feature_key AND e.enabled
  )
$$;
CREATE OR REPLACE FUNCTION app_private.current_plan_meets(_minimum public.plan_code)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app_private AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND app_private.plan_rank(p.plan) >= app_private.plan_rank(_minimum)
  )
$$;
REVOKE ALL ON FUNCTION app_private.plan_rank(public.plan_code), app_private.current_user_has_entitlement(text), app_private.current_plan_meets(public.plan_code) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.plan_rank(public.plan_code), app_private.current_user_has_entitlement(text), app_private.current_plan_meets(public.plan_code) TO authenticated, service_role;

CREATE TABLE public.perception_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context text NOT NULL CHECK (context IN ('executive','meeting','stage','social','casual','training','professional_image')),
  desired_signals text[] NOT NULL DEFAULT '{}',
  status public.perception_scan_status NOT NULL DEFAULT 'processing',
  provider text,
  model text,
  coherence_score integer CHECK (coherence_score BETWEEN 0 AND 100),
  posture_score integer CHECK (posture_score BETWEEN 0 AND 100),
  presence_score integer CHECK (presence_score BETWEEN 0 AND 100),
  appearance_score integer CHECK (appearance_score BETWEEN 0 AND 100),
  body_language_score integer CHECK (body_language_score BETWEEN 0 AND 100),
  context_score integer CHECK (context_score BETWEEN 0 AND 100),
  summary text,
  priority text,
  next_action text,
  admin_note text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  new_scan_requested_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.perception_scans TO authenticated;
GRANT UPDATE (admin_note, reviewed_by, reviewed_at, new_scan_requested_at, status) ON public.perception_scans TO authenticated;
GRANT ALL ON public.perception_scans TO service_role;
ALTER TABLE public.perception_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY perception_scans_read ON public.perception_scans FOR SELECT TO authenticated USING (user_id = auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY perception_scans_create ON public.perception_scans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'processing' AND coherence_score IS NULL AND provider IS NULL AND model IS NULL);
CREATE POLICY perception_scans_owner_delete ON public.perception_scans FOR DELETE TO authenticated USING (user_id = auth.uid() OR app_private.is_staff(auth.uid()));
CREATE POLICY perception_scans_staff_update ON public.perception_scans FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER perception_scans_updated BEFORE UPDATE ON public.perception_scans FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.perception_scan_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.perception_scans(id) ON DELETE CASCADE,
  image_type text NOT NULL CHECK (image_type IN ('front','profile','back','professional')),
  storage_path text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(scan_id,image_type)
);
GRANT SELECT, INSERT, DELETE ON public.perception_scan_images TO authenticated;
GRANT ALL ON public.perception_scan_images TO service_role;
ALTER TABLE public.perception_scan_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY perception_images_read ON public.perception_scan_images FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.perception_scans s WHERE s.id = scan_id AND (s.user_id = auth.uid() OR app_private.is_staff(auth.uid()))));
CREATE POLICY perception_images_create ON public.perception_scan_images FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.perception_scans s WHERE s.id = scan_id AND s.user_id = auth.uid() AND s.status = 'processing'));
CREATE POLICY perception_images_delete ON public.perception_scan_images FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.perception_scans s WHERE s.id = scan_id AND (s.user_id = auth.uid() OR app_private.is_staff(auth.uid()))));

CREATE TABLE public.perception_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.perception_scans(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('posture_presence','clothing_fit','body_language','context','coherence','works','friction')),
  type text NOT NULL CHECK (type IN ('strength','friction','layer')),
  title text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL,
  recommendation text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.perception_findings TO authenticated;
GRANT ALL ON public.perception_findings TO service_role;
ALTER TABLE public.perception_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY perception_findings_read ON public.perception_findings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.perception_scans s WHERE s.id = scan_id AND (s.user_id = auth.uid() OR app_private.is_staff(auth.uid()))));

CREATE TABLE public.perception_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.perception_scans(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  title text NOT NULL,
  instruction text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(scan_id,day_number)
);
GRANT SELECT, UPDATE (completed, completed_at) ON public.perception_actions TO authenticated;
GRANT ALL ON public.perception_actions TO service_role;
ALTER TABLE public.perception_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY perception_actions_read ON public.perception_actions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.perception_scans s WHERE s.id = scan_id AND (s.user_id = auth.uid() OR app_private.is_staff(auth.uid()))));
CREATE POLICY perception_actions_owner_update ON public.perception_actions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.perception_scans s WHERE s.id = scan_id AND s.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.perception_scans s WHERE s.id = scan_id AND s.user_id = auth.uid()));

CREATE TABLE public.member_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('briefings','protocols','sessions','playbooks','experiences','archive')),
  content_type text NOT NULL CHECK (content_type IN ('text','video','audio','pdf','lesson')),
  eyebrow text,
  excerpt text NOT NULL,
  body text NOT NULL,
  cover_url text,
  asset_path text,
  duration_label text,
  minimum_plan public.plan_code NOT NULL DEFAULT 'free',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  published_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_contents TO authenticated;
GRANT ALL ON public.member_contents TO service_role;
ALTER TABLE public.member_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY member_contents_read ON public.member_contents FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR (active AND published_at IS NOT NULL AND app_private.current_user_has_entitlement('can_access_member_library') AND app_private.current_plan_meets(minimum_plan)));
CREATE POLICY member_contents_staff_write ON public.member_contents FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER member_contents_updated BEFORE UPDATE ON public.member_contents FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.member_content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.member_contents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_id,user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.member_content_views TO authenticated;
GRANT ALL ON public.member_content_views TO service_role;
ALTER TABLE public.member_content_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY member_views_owner ON public.member_content_views FOR ALL TO authenticated USING (user_id = auth.uid() OR app_private.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid() OR app_private.is_staff(auth.uid()));

CREATE TABLE public.member_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  location text,
  starts_at timestamptz,
  cover_url text,
  minimum_plan public.plan_code NOT NULL DEFAULT 'premium',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_experiences TO authenticated;
GRANT ALL ON public.member_experiences TO service_role;
ALTER TABLE public.member_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY member_experiences_read ON public.member_experiences FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR (active AND app_private.current_plan_meets(minimum_plan)));
CREATE POLICY member_experiences_staff_write ON public.member_experiences FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER member_experiences_updated BEFORE UPDATE ON public.member_experiences FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.experience_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.member_experiences(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(experience_id,user_id)
);
GRANT SELECT, INSERT, DELETE ON public.experience_interests TO authenticated;
GRANT ALL ON public.experience_interests TO service_role;
ALTER TABLE public.experience_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY experience_interests_owner ON public.experience_interests FOR ALL TO authenticated USING (user_id = auth.uid() OR app_private.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid() OR app_private.is_staff(auth.uid()));

CREATE TABLE public.select_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.select_collections TO authenticated;
GRANT ALL ON public.select_collections TO service_role;
ALTER TABLE public.select_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_collections_read ON public.select_collections FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR (active AND app_private.current_user_has_entitlement('can_access_sim_select')));
CREATE POLICY select_collections_staff_write ON public.select_collections FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER select_collections_updated BEFORE UPDATE ON public.select_collections FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.select_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  logo_url text,
  cover_url text,
  description text NOT NULL,
  why_selected text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.select_partners TO authenticated;
GRANT ALL ON public.select_partners TO service_role;
ALTER TABLE public.select_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_partners_read ON public.select_partners FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR (active AND app_private.current_user_has_entitlement('can_access_sim_select')));
CREATE POLICY select_partners_staff_write ON public.select_partners FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER select_partners_updated BEFORE UPDATE ON public.select_partners FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE TABLE public.select_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.select_partners(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  coupon_code text,
  external_url text,
  minimum_plan public.plan_code NOT NULL DEFAULT 'paid',
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.select_benefits TO authenticated;
GRANT ALL ON public.select_benefits TO service_role;
ALTER TABLE public.select_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_benefits_read ON public.select_benefits FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()) OR (active AND app_private.current_user_has_entitlement('can_access_sim_select') AND app_private.current_plan_meets(minimum_plan) AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())));
CREATE POLICY select_benefits_staff_write ON public.select_benefits FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));
CREATE TRIGGER select_benefits_updated BEFORE UPDATE ON public.select_benefits FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE INDEX perception_scans_user_created_idx ON public.perception_scans(user_id, created_at DESC);
CREATE INDEX perception_images_scan_idx ON public.perception_scan_images(scan_id);
CREATE INDEX perception_findings_scan_sort_idx ON public.perception_findings(scan_id, sort_order);
CREATE INDEX perception_actions_scan_day_idx ON public.perception_actions(scan_id, day_number);
CREATE INDEX member_contents_category_published_idx ON public.member_contents(category, published_at DESC);
CREATE INDEX member_views_user_idx ON public.member_content_views(user_id, viewed_at DESC);
CREATE INDEX experience_interests_user_idx ON public.experience_interests(user_id, created_at DESC);
CREATE INDEX crm_events_user_created_idx ON public.crm_events(user_id, created_at DESC);
CREATE INDEX sessions_user_started_idx ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX checkins_user_date_idx ON public.daily_checkins(user_id, checkin_date DESC);

DROP POLICY protocol_history_staff_write ON public.protocol_status_history;
CREATE POLICY protocol_history_staff_insert ON public.protocol_status_history FOR INSERT TO authenticated WITH CHECK (app_private.is_staff(auth.uid()) AND changed_by = auth.uid());
DROP POLICY admin_notes_staff_access ON public.admin_notes;
CREATE POLICY admin_notes_staff_read ON public.admin_notes FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE POLICY admin_notes_staff_insert ON public.admin_notes FOR INSERT TO authenticated WITH CHECK (app_private.is_staff(auth.uid()) AND author_id = auth.uid());
CREATE POLICY admin_notes_author_update ON public.admin_notes FOR UPDATE TO authenticated USING (app_private.is_staff(auth.uid()) AND author_id = auth.uid()) WITH CHECK (app_private.is_staff(auth.uid()) AND author_id = auth.uid());
CREATE POLICY admin_notes_author_delete ON public.admin_notes FOR DELETE TO authenticated USING (app_private.is_staff(auth.uid()) AND author_id = auth.uid());

CREATE POLICY perception_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'perception-scans' AND ((storage.foldername(name))[1] = auth.uid()::text OR app_private.is_staff(auth.uid())));
CREATE POLICY perception_storage_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'perception-scans' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY perception_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'perception-scans' AND ((storage.foldername(name))[1] = auth.uid()::text OR app_private.is_staff(auth.uid())));
CREATE POLICY member_media_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'member-media' AND app_private.current_user_has_entitlement('can_access_member_library'));
CREATE POLICY member_media_staff_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'member-media' AND app_private.is_staff(auth.uid()));
CREATE POLICY member_media_staff_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'member-media' AND app_private.is_staff(auth.uid())) WITH CHECK (bucket_id = 'member-media' AND app_private.is_staff(auth.uid()));
CREATE POLICY member_media_staff_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'member-media' AND app_private.is_staff(auth.uid()));

INSERT INTO public.plan_entitlements(plan,feature_key,enabled) VALUES
('free','can_access_member_library',true),('paid','can_access_member_library',true),('plus','can_access_member_library',true),('premium','can_access_member_library',true),
('free','can_access_premium_library',false),('paid','can_access_premium_library',false),('plus','can_access_premium_library',true),('premium','can_access_premium_library',true),
('free','can_access_perception_lab',false),('paid','can_access_perception_lab',false),('plus','can_access_perception_lab',true),('premium','can_access_perception_lab',true),
('free','can_access_sim_select',false),('paid','can_access_sim_select',true),('plus','can_access_sim_select',true),('premium','can_access_sim_select',true),
('free','can_access_experiences',false),('paid','can_access_experiences',false),('plus','can_access_experiences',true),('premium','can_access_experiences',true)
ON CONFLICT(plan,feature_key) DO UPDATE SET enabled = EXCLUDED.enabled;

INSERT INTO public.member_contents(title,slug,category,content_type,eyebrow,excerpt,body,duration_label,minimum_plan,featured,published_at) VALUES
('Sono para quem carrega responsabilidade','sono-responsabilidade','briefings','text','SIM Briefing','Recuperação não é pausa da performance. É parte de sua sustentação.','Observe sua janela real de sono durante sete dias. Proteja um horário consistente de encerramento, reduza decisões tardias e registre como energia e foco respondem. O objetivo não é perfeição: é tornar a recuperação visível e governável.','4 min','free',true,now()),
('Como recuperar governo da agenda','governo-agenda','briefings','text','SIM Briefing','Uma agenda cheia pode esconder ausência de comando.','Escolha três compromissos que definem o dia e estabeleça limites claros para o restante. Reserve transições entre blocos de alta exigência. Governo da agenda começa quando prioridade deixa de ser intenção e passa a ocupar espaço protegido.','5 min','paid',true,now()),
('Presença antes da apresentação','presenca-apresentacao','briefings','text','SIM Briefing','A leitura da sala começa antes da primeira frase.','Antes de entrar, estabilize a base, desacelere a chegada e permita que o olhar reconheça o ambiente. Ajustes pequenos e observáveis reduzem ruído entre a mensagem preparada e os sinais visíveis que a acompanham.','3 min','plus',true,now()),
('Treinar viajando','treinar-viajando','playbooks','text','SIM Playbook','Continuidade sem transformar a viagem em punição.','Defina previamente a menor sessão que preserva ritmo e disponibilidade. Use o que o ambiente oferece, mantenha a execução simples e registre o realizado. Em deslocamento, consistência vale mais do que complexidade.','6 min','paid',false,now()),
('O primeiro uniforme','primeiro-uniforme','briefings','text','SIM Briefing','Menos decisão. Mais coerência visual.','Identifique a combinação de peças que melhor sustenta sua rotina, seu contexto e a intenção que deseja comunicar. Repita a estrutura, ajuste o caimento e varie apenas os elementos que não comprometem a leitura principal.','4 min','premium',false,now());

INSERT INTO public.select_collections(name,slug,description,sort_order) VALUES
('Performance','performance','Ferramentas escolhidas para sustentar execução e capacidade.',1),
('Nutrition','nutrition','Critério aplicado ao que acompanha sua rotina alimentar.',2),
('Recovery','recovery','Recursos para proteger recuperação e continuidade.',3),
('Style','style','Escolhas que reduzem ruído e ampliam coerência.',4),
('Technology','technology','Tecnologia que merece ocupar espaço na rotina.',5),
('Travel','travel','Soluções para manter governo em movimento.',6),
('Experiences','experiences','Acessos que ampliam repertório, presença e relações.',7);

INSERT INTO public.select_partners(name,slug,category,description,why_selected,active,featured) VALUES
('SOLDIER','soldier','Performance Nutrition','Performance Nutrition para rotinas de alta exigência.','Selecionada por sua relação direta com consistência, conveniência e suporte à rotina do membro. Os detalhes comerciais serão disponibilizados somente após validação da parceria.',true,true);
INSERT INTO public.select_benefits(partner_id,title,description,minimum_plan,active)
SELECT id,'Acesso de membro','Benefício em preparação. Cupom e link serão liberados após validação da parceria.','paid',true FROM public.select_partners WHERE slug='soldier';