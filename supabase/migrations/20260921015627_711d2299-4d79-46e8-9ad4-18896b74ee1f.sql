DROP POLICY IF EXISTS exercise_media_members_read ON storage.objects;
CREATE POLICY exercise_media_members_read
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'exercise-media'
  AND EXISTS (
    SELECT 1
    FROM public.exercise_library exercise
    WHERE exercise.active = true
      AND (exercise.video_storage_path = storage.objects.name OR exercise.image_storage_path = storage.objects.name)
  )
);