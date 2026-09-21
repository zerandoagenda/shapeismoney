ALTER TABLE public.exercise_library
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_external_id text,
  ADD COLUMN IF NOT EXISTS source_attribution text,
  ADD COLUMN IF NOT EXISTS source_authorized boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_video_url text,
  ADD COLUMN IF NOT EXISTS source_image_url text,
  ADD COLUMN IF NOT EXISTS video_storage_path text,
  ADD COLUMN IF NOT EXISTS image_storage_path text,
  ADD COLUMN IF NOT EXISTS import_status text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS exercise_library_source_identity_idx
  ON public.exercise_library (source_name, source_external_id)
  WHERE source_name IS NOT NULL AND source_external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS exercise_library_normalized_name_idx
  ON public.exercise_library (lower(trim(name)));

CREATE TABLE public.exercise_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_catalog_url text NOT NULL,
  requested_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','discovering','importing','completed','completed_with_errors','failed','paused')),
  discovered_count integer NOT NULL DEFAULT 0,
  processed_count integer NOT NULL DEFAULT 0,
  imported_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  duplicate_count integer NOT NULL DEFAULT 0,
  without_video_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  cursor_url text,
  error_summary text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_import_batches TO authenticated;
GRANT ALL ON public.exercise_import_batches TO service_role;
ALTER TABLE public.exercise_import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercise_import_batches_staff" ON public.exercise_import_batches
  FOR ALL TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['coach','nutritionist','support','manager','admin','admin_master','content','analyst','relationship','nutrition','specialist']::public.app_role[]))
  WITH CHECK (app_private.has_any_staff_role(auth.uid(), ARRAY['coach','nutritionist','support','manager','admin','admin_master','content','analyst','relationship','nutrition','specialist']::public.app_role[]));

CREATE TABLE public.exercise_import_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.exercise_import_batches(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES public.exercise_library(id) ON DELETE SET NULL,
  source_url text NOT NULL,
  source_external_id text,
  source_name text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','imported','updated','duplicate','without_video','failed')),
  video_storage_path text,
  image_storage_path text,
  error_message text,
  raw_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, source_url)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_import_items TO authenticated;
GRANT ALL ON public.exercise_import_items TO service_role;
ALTER TABLE public.exercise_import_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercise_import_items_staff" ON public.exercise_import_items
  FOR ALL TO authenticated USING (app_private.has_any_staff_role(auth.uid(), ARRAY['coach','nutritionist','support','manager','admin','admin_master','content','analyst','relationship','nutrition','specialist']::public.app_role[]))
  WITH CHECK (app_private.has_any_staff_role(auth.uid(), ARRAY['coach','nutritionist','support','manager','admin','admin_master','content','analyst','relationship','nutrition','specialist']::public.app_role[]));
CREATE INDEX exercise_import_items_batch_status_idx ON public.exercise_import_items(batch_id, status);

CREATE TRIGGER exercise_import_batches_updated BEFORE UPDATE ON public.exercise_import_batches
FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE TRIGGER exercise_import_items_updated BEFORE UPDATE ON public.exercise_import_items
FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();

CREATE POLICY "exercise_media_staff_all" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'exercise-media' AND app_private.has_any_staff_role(auth.uid(), ARRAY['coach','nutritionist','support','manager','admin','admin_master','content','analyst','relationship','nutrition','specialist']::public.app_role[]))
WITH CHECK (bucket_id = 'exercise-media' AND app_private.has_any_staff_role(auth.uid(), ARRAY['coach','nutritionist','support','manager','admin','admin_master','content','analyst','relationship','nutrition','specialist']::public.app_role[]));
CREATE POLICY "exercise_media_members_read" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'exercise-media'
  AND EXISTS (
    SELECT 1 FROM public.exercise_library e
    WHERE e.active = true
      AND (e.video_storage_path = name OR e.image_storage_path = name)
  )
);