ALTER TABLE public.daily_checkins
  DROP CONSTRAINT IF EXISTS daily_checkins_pain_check;

ALTER TABLE public.daily_checkins
  ADD CONSTRAINT daily_checkins_pain_check CHECK (pain IS NULL OR pain BETWEEN 0 AND 5);