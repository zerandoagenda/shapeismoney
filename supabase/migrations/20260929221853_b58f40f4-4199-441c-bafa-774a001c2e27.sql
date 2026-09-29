CREATE TABLE public.radar_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_hash text NOT NULL,
  source text NOT NULL DEFAULT 'direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  landing_page text,
  visited_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.radar_visits TO authenticated;
GRANT ALL ON public.radar_visits TO service_role;
ALTER TABLE public.radar_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY radar_visits_staff_read ON public.radar_visits FOR SELECT TO authenticated USING (app_private.is_staff(auth.uid()));
CREATE INDEX radar_visits_visited_idx ON public.radar_visits(visited_at DESC);
CREATE INDEX radar_visits_hash_day_idx ON public.radar_visits(visitor_hash, visited_at DESC);

CREATE POLICY radar_reports_storage_staff_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='radar-reports' AND app_private.is_staff(auth.uid()));
CREATE POLICY radar_reports_storage_service_manage ON storage.objects FOR ALL TO service_role USING (bucket_id='radar-reports') WITH CHECK (bucket_id='radar-reports');