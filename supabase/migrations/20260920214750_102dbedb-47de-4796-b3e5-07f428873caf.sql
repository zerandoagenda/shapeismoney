create type public.app_role as enum ('student','coach','nutritionist','support','manager','admin','admin_master');
create type public.plan_code as enum ('free','paid','plus','premium');
create type public.protocol_status as enum ('data_received','in_analysis','building','in_review','approved','published');

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;

create table public.profiles (
  id uuid primary key,
  first_name text not null default '', last_name text not null default '', phone text, birth_date date,
  sex text, height_cm numeric(5,2), weight_kg numeric(6,2), city text, state text, country text default 'Brasil', country_code text default 'BR',
  profession text, company text, job_title text, bio text, avatar_path text, plan public.plan_code not null default 'free',
  onboarding_completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select,insert,update,delete on public.profiles to authenticated; grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, role public.app_role not null default 'student', created_at timestamptz not null default now(), unique(user_id,role)
);
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid,_role public.app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create or replace function public.is_staff(_user_id uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role in ('coach','nutritionist','support','manager','admin','admin_master')) $$;

create policy profiles_own_select on public.profiles for select to authenticated using (id=auth.uid() or public.is_staff(auth.uid()));
create policy profiles_own_insert on public.profiles for insert to authenticated with check (id=auth.uid());
create policy profiles_own_update on public.profiles for update to authenticated using (id=auth.uid() or public.is_staff(auth.uid())) with check (id=auth.uid() or public.is_staff(auth.uid()));
create policy roles_own_select on public.user_roles for select to authenticated using (user_id=auth.uid() or public.is_staff(auth.uid()));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,first_name,last_name) values(new.id,coalesce(new.raw_user_meta_data->>'first_name',''),coalesce(new.raw_user_meta_data->>'last_name','')); insert into public.user_roles(user_id,role) values(new.id,'student'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create table public.plans (code public.plan_code primary key, name text not null, description text, active boolean not null default true);
grant select on public.plans to authenticated; grant all on public.plans to service_role; alter table public.plans enable row level security;
create policy plans_read on public.plans for select to authenticated using (true);

create table public.plan_entitlements (id uuid primary key default gen_random_uuid(), plan public.plan_code not null references public.plans(code) on delete cascade, feature_key text not null, enabled boolean not null default false, unique(plan,feature_key));
grant select on public.plan_entitlements to authenticated; grant all on public.plan_entitlements to service_role; alter table public.plan_entitlements enable row level security;
create policy entitlements_read on public.plan_entitlements for select to authenticated using (true);

create table public.onboarding_responses (id uuid primary key default gen_random_uuid(), user_id uuid not null, responses jsonb not null default '{}'::jsonb, current_step int not null default 0, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id));
grant select,insert,update,delete on public.onboarding_responses to authenticated; grant all on public.onboarding_responses to service_role; alter table public.onboarding_responses enable row level security;
create policy onboarding_owner on public.onboarding_responses for all to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid())) with check(user_id=auth.uid() or public.is_staff(auth.uid()));
create trigger onboarding_updated before update on public.onboarding_responses for each row execute function public.set_updated_at();

create table public.sim_scores (id uuid primary key default gen_random_uuid(), user_id uuid not null, total int not null check(total between 0 and 100), construction int not null check(construction between 0 and 100), capacity int not null check(capacity between 0 and 100), governance int not null check(governance between 0 and 100), perception int not null check(perception between 0 and 100), execution int not null check(execution between 0 and 100), strongest_pillar text, bottleneck text, priority text, coherence_level text, recommendation text, source text not null default 'onboarding', created_at timestamptz not null default now());
grant select,insert,update,delete on public.sim_scores to authenticated; grant all on public.sim_scores to service_role; alter table public.sim_scores enable row level security;
create policy scores_owner on public.sim_scores for all to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid())) with check(user_id=auth.uid() or public.is_staff(auth.uid()));

create table public.daily_checkins (id uuid primary key default gen_random_uuid(), user_id uuid not null, checkin_date date not null default current_date, sleep_quality int check(sleep_quality between 1 and 5), energy int check(energy between 1 and 5), stress int check(stress between 1 and 5), pain int check(pain between 0 and 5), trained boolean, nutrition_on_track boolean, hydration int check(hydration between 1 and 5), created_at timestamptz not null default now(), unique(user_id,checkin_date));
grant select,insert,update,delete on public.daily_checkins to authenticated; grant all on public.daily_checkins to service_role; alter table public.daily_checkins enable row level security;
create policy daily_owner on public.daily_checkins for all to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid())) with check(user_id=auth.uid() or public.is_staff(auth.uid()));

create table public.weekly_reviews (id uuid primary key default gen_random_uuid(), user_id uuid not null, week_start date not null, planned_workouts int not null default 0, completed_workouts int not null default 0, nutrition int, sleep int, stress int, energy int, productivity int, focus int, schedule_control int, relationships int, quality_time int, professional_performance int, created_at timestamptz not null default now(), unique(user_id,week_start));
grant select,insert,update,delete on public.weekly_reviews to authenticated; grant all on public.weekly_reviews to service_role; alter table public.weekly_reviews enable row level security;
create policy weekly_owner on public.weekly_reviews for all to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid())) with check(user_id=auth.uid() or public.is_staff(auth.uid()));

create table public.exercise_library (id uuid primary key default gen_random_uuid(), name text not null, muscle_group text not null, category text, equipment text, level text, image_url text, video_url text, avatar_animation_url text, description text, technique text, common_errors text, notes text, active boolean not null default true, created_at timestamptz not null default now());
grant select on public.exercise_library to authenticated; grant insert,update,delete on public.exercise_library to authenticated; grant all on public.exercise_library to service_role; alter table public.exercise_library enable row level security;
create policy exercises_read on public.exercise_library for select to authenticated using(active or public.is_staff(auth.uid()));
create policy exercises_staff_write on public.exercise_library for all to authenticated using(public.is_staff(auth.uid())) with check(public.is_staff(auth.uid()));

create table public.workout_programs (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, objective text, status text not null default 'draft', starts_on date, ends_on date, created_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select,insert,update,delete on public.workout_programs to authenticated; grant all on public.workout_programs to service_role; alter table public.workout_programs enable row level security;
create policy programs_access on public.workout_programs for select to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid()));
create policy programs_staff_write on public.workout_programs for all to authenticated using(public.is_staff(auth.uid())) with check(public.is_staff(auth.uid()));
create trigger programs_updated before update on public.workout_programs for each row execute function public.set_updated_at();

create table public.workouts (id uuid primary key default gen_random_uuid(), program_id uuid not null references public.workout_programs(id) on delete cascade, name text not null, sequence int not null default 0, estimated_minutes int, notes text, created_at timestamptz not null default now());
grant select,insert,update,delete on public.workouts to authenticated; grant all on public.workouts to service_role; alter table public.workouts enable row level security;
create policy workouts_access on public.workouts for select to authenticated using(exists(select 1 from public.workout_programs p where p.id=program_id and (p.user_id=auth.uid() or public.is_staff(auth.uid()))));
create policy workouts_staff_write on public.workouts for all to authenticated using(public.is_staff(auth.uid())) with check(public.is_staff(auth.uid()));

create table public.workout_exercises (id uuid primary key default gen_random_uuid(), workout_id uuid not null references public.workouts(id) on delete cascade, exercise_id uuid not null references public.exercise_library(id), sequence int not null default 0, sets int not null default 3, reps text not null default '8–12', rest_seconds int not null default 60, target_rpe numeric(3,1), notes text);
grant select,insert,update,delete on public.workout_exercises to authenticated; grant all on public.workout_exercises to service_role; alter table public.workout_exercises enable row level security;
create policy workout_exercises_read on public.workout_exercises for select to authenticated using(exists(select 1 from public.workouts w join public.workout_programs p on p.id=w.program_id where w.id=workout_id and (p.user_id=auth.uid() or public.is_staff(auth.uid()))));
create policy workout_exercises_staff_write on public.workout_exercises for all to authenticated using(public.is_staff(auth.uid())) with check(public.is_staff(auth.uid()));

create table public.workout_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null, workout_id uuid references public.workouts(id), started_at timestamptz not null default now(), completed_at timestamptz, duration_minutes int, completion_percent int check(completion_percent between 0 and 100), exercise_log jsonb not null default '[]'::jsonb, notes text);
grant select,insert,update,delete on public.workout_sessions to authenticated; grant all on public.workout_sessions to service_role; alter table public.workout_sessions enable row level security;
create policy sessions_owner on public.workout_sessions for all to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid())) with check(user_id=auth.uid() or public.is_staff(auth.uid()));

create table public.protocols (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null default 'Protocolo executivo', status public.protocol_status not null default 'data_received', objective text, draft_data jsonb not null default '{}'::jsonb, approved_at timestamptz, published_at timestamptz, created_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select,insert,update,delete on public.protocols to authenticated; grant all on public.protocols to service_role; alter table public.protocols enable row level security;
create policy protocols_read on public.protocols for select to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid()));
create policy protocols_staff_write on public.protocols for all to authenticated using(public.is_staff(auth.uid())) with check(public.is_staff(auth.uid()));
create trigger protocols_updated before update on public.protocols for each row execute function public.set_updated_at();

create table public.crm_events (id uuid primary key default gen_random_uuid(), user_id uuid not null, event_type text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
grant select,insert on public.crm_events to authenticated; grant all on public.crm_events to service_role; alter table public.crm_events enable row level security;
create policy crm_owner_read on public.crm_events for select to authenticated using(user_id=auth.uid() or public.is_staff(auth.uid()));
create policy crm_owner_insert on public.crm_events for insert to authenticated with check(user_id=auth.uid() or public.is_staff(auth.uid()));

insert into public.plans(code,name,description) values ('free','Free','Diagnóstico e visão inicial'),('paid','Pago','Treino, nutrição e comunidade'),('plus','Plus','Performance ampliada'),('premium','Premium','Concierge de performance executiva');
insert into public.plan_entitlements(plan,feature_key,enabled) select p.code,f.key, case when p.code='premium' then true when p.code='plus' then f.key not in ('can_access_club') when p.code='paid' then f.key in ('can_access_training','can_access_nutrition','can_access_community','can_access_money_brain') else f.key in ('can_access_money_brain') end from public.plans p cross join (values ('can_access_training'),('can_access_nutrition'),('can_access_community'),('can_access_money_brain'),('can_access_image_analysis'),('can_access_premium_coaching'),('can_access_club'),('can_access_marketplace')) f(key);
insert into public.exercise_library(name,muscle_group,category,equipment,level,description,technique) values ('Agachamento Goblet','Pernas','Força','Halter','Iniciante','Construção de força global e controle do tronco.','Mantenha o tronco alto e desça com controle.'),('Supino com halteres','Peitoral','Força','Halteres','Intermediário','Força de empurrar com amplitude controlada.','Escápulas apoiadas e punhos neutros.'),('Remada baixa','Costas','Força','Cabo','Iniciante','Estabilidade escapular e força de tração.','Conduza os cotovelos sem perder a postura.'),('Levantamento terra romeno','Posterior','Força','Barra','Intermediário','Força de cadeia posterior e padrão de quadril.','Quadril para trás, coluna neutra e carga próxima ao corpo.');