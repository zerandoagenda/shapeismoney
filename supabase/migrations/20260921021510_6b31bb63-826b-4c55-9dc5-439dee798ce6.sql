ALTER TABLE public.workout_programs DROP CONSTRAINT IF EXISTS workout_programs_creation_source_check;
ALTER TABLE public.workout_programs ADD CONSTRAINT workout_programs_creation_source_check CHECK (creation_source IN ('PDF_IMPORT','TEXT_IMPORT','MANUAL','AI_DRAFT'));

ALTER TABLE public.training_imports ADD COLUMN IF NOT EXISTS import_source text NOT NULL DEFAULT 'PDF_IMPORT';
ALTER TABLE public.training_imports ADD COLUMN IF NOT EXISTS source_text text;
ALTER TABLE public.training_imports ALTER COLUMN storage_path DROP NOT NULL;
ALTER TABLE public.training_imports ALTER COLUMN original_filename DROP NOT NULL;
ALTER TABLE public.training_imports ALTER COLUMN mime_type DROP NOT NULL;
ALTER TABLE public.training_imports DROP CONSTRAINT IF EXISTS training_imports_mime_type_check;
ALTER TABLE public.training_imports ADD CONSTRAINT training_imports_import_source_check CHECK (import_source IN ('PDF_IMPORT','TEXT_IMPORT'));
ALTER TABLE public.training_imports ADD CONSTRAINT training_imports_source_payload_check CHECK (
  (import_source = 'PDF_IMPORT' AND storage_path IS NOT NULL AND original_filename IS NOT NULL AND mime_type = 'application/pdf')
  OR
  (import_source = 'TEXT_IMPORT' AND source_text IS NOT NULL AND length(btrim(source_text)) > 0)
);