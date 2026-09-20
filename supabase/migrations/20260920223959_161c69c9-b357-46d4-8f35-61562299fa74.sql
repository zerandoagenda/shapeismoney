ALTER TABLE public.workout_programs ADD COLUMN notes text;
ALTER TABLE public.workout_exercises ADD COLUMN initial_load numeric(7,2);
ALTER TABLE public.workout_exercises ADD CONSTRAINT workout_exercises_initial_load_check CHECK (initial_load IS NULL OR initial_load >= 0);
ALTER TABLE public.workout_exercises ADD CONSTRAINT workout_exercises_sets_check CHECK (sets > 0);
ALTER TABLE public.workout_exercises ADD CONSTRAINT workout_exercises_rest_check CHECK (rest_seconds >= 0);
ALTER TABLE public.workout_exercises ADD CONSTRAINT workout_exercises_rpe_check CHECK (target_rpe IS NULL OR target_rpe BETWEEN 0 AND 10);

CREATE TABLE public.nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  objective text,
  calorie_target integer,
  protein_target numeric(7,2),
  carbs_target numeric(7,2),
  fat_target numeric(7,2),
  water_target_ml integer,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT nutrition_calorie_target_check CHECK (calorie_target IS NULL OR calorie_target >= 0),
  CONSTRAINT nutrition_protein_target_check CHECK (protein_target IS NULL OR protein_target >= 0),
  CONSTRAINT nutrition_carbs_target_check CHECK (carbs_target IS NULL OR carbs_target >= 0),
  CONSTRAINT nutrition_fat_target_check CHECK (fat_target IS NULL OR fat_target >= 0),
  CONSTRAINT nutrition_water_target_check CHECK (water_target_ml IS NULL OR water_target_ml >= 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_plans TO authenticated;
GRANT ALL ON public.nutrition_plans TO service_role;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY nutrition_plans_read ON public.nutrition_plans FOR SELECT TO authenticated USING ((user_id = auth.uid() AND status = 'published') OR app_private.is_staff(auth.uid()));
CREATE POLICY nutrition_plans_staff_write ON public.nutrition_plans FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.nutrition_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrition_plan_id uuid NOT NULL REFERENCES public.nutrition_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  meal_order integer NOT NULL DEFAULT 0,
  suggested_time time,
  instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_meals TO authenticated;
GRANT ALL ON public.nutrition_meals TO service_role;
ALTER TABLE public.nutrition_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY nutrition_meals_read ON public.nutrition_meals FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.nutrition_plans p WHERE p.id = nutrition_plan_id AND ((p.user_id = auth.uid() AND p.status = 'published') OR app_private.is_staff(auth.uid()))));
CREATE POLICY nutrition_meals_staff_write ON public.nutrition_meals FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TABLE public.nutrition_meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES public.nutrition_meals(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  quantity numeric(8,2),
  unit text,
  calories integer,
  protein numeric(7,2),
  carbs numeric(7,2),
  fat numeric(7,2),
  notes text,
  item_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nutrition_item_quantity_check CHECK (quantity IS NULL OR quantity >= 0),
  CONSTRAINT nutrition_item_calories_check CHECK (calories IS NULL OR calories >= 0),
  CONSTRAINT nutrition_item_protein_check CHECK (protein IS NULL OR protein >= 0),
  CONSTRAINT nutrition_item_carbs_check CHECK (carbs IS NULL OR carbs >= 0),
  CONSTRAINT nutrition_item_fat_check CHECK (fat IS NULL OR fat >= 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_meal_items TO authenticated;
GRANT ALL ON public.nutrition_meal_items TO service_role;
ALTER TABLE public.nutrition_meal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY nutrition_items_read ON public.nutrition_meal_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.nutrition_meals m JOIN public.nutrition_plans p ON p.id = m.nutrition_plan_id WHERE m.id = meal_id AND ((p.user_id = auth.uid() AND p.status = 'published') OR app_private.is_staff(auth.uid()))));
CREATE POLICY nutrition_items_staff_write ON public.nutrition_meal_items FOR ALL TO authenticated USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

CREATE TRIGGER nutrition_plans_updated BEFORE UPDATE ON public.nutrition_plans FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE TRIGGER nutrition_meals_updated BEFORE UPDATE ON public.nutrition_meals FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
CREATE TRIGGER nutrition_meal_items_updated BEFORE UPDATE ON public.nutrition_meal_items FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();