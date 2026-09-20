create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated, service_role;

create or replace function app_private.set_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;
create or replace function app_private.has_role(_user_id uuid,_role public.app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create or replace function app_private.is_staff(_user_id uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role in ('coach','nutritionist','support','manager','admin','admin_master')) $$;
create or replace function app_private.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,first_name,last_name) values(new.id,coalesce(new.raw_user_meta_data->>'first_name',''),coalesce(new.raw_user_meta_data->>'last_name','')); insert into public.user_roles(user_id,role) values(new.id,'student'); return new; end $$;
revoke all on all functions in schema app_private from public, anon;
grant execute on function app_private.has_role(uuid,public.app_role), app_private.is_staff(uuid) to authenticated, service_role;

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function app_private.handle_new_user();
drop trigger profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles for each row execute function app_private.set_updated_at();
drop trigger onboarding_updated on public.onboarding_responses;
create trigger onboarding_updated before update on public.onboarding_responses for each row execute function app_private.set_updated_at();
drop trigger programs_updated on public.workout_programs;
create trigger programs_updated before update on public.workout_programs for each row execute function app_private.set_updated_at();
drop trigger protocols_updated on public.protocols;
create trigger protocols_updated before update on public.protocols for each row execute function app_private.set_updated_at();

alter policy profiles_own_select on public.profiles using (id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy profiles_own_update on public.profiles using (id=auth.uid() or app_private.is_staff(auth.uid())) with check (id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy roles_own_select on public.user_roles using (user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy onboarding_owner on public.onboarding_responses using(user_id=auth.uid() or app_private.is_staff(auth.uid())) with check(user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy scores_owner on public.sim_scores using(user_id=auth.uid() or app_private.is_staff(auth.uid())) with check(user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy daily_owner on public.daily_checkins using(user_id=auth.uid() or app_private.is_staff(auth.uid())) with check(user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy weekly_owner on public.weekly_reviews using(user_id=auth.uid() or app_private.is_staff(auth.uid())) with check(user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy exercises_read on public.exercise_library using(active or app_private.is_staff(auth.uid()));
alter policy exercises_staff_write on public.exercise_library using(app_private.is_staff(auth.uid())) with check(app_private.is_staff(auth.uid()));
alter policy programs_access on public.workout_programs using(user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy programs_staff_write on public.workout_programs using(app_private.is_staff(auth.uid())) with check(app_private.is_staff(auth.uid()));
alter policy workouts_access on public.workouts using(exists(select 1 from public.workout_programs p where p.id=program_id and (p.user_id=auth.uid() or app_private.is_staff(auth.uid()))));
alter policy workouts_staff_write on public.workouts using(app_private.is_staff(auth.uid())) with check(app_private.is_staff(auth.uid()));
alter policy workout_exercises_read on public.workout_exercises using(exists(select 1 from public.workouts w join public.workout_programs p on p.id=w.program_id where w.id=workout_id and (p.user_id=auth.uid() or app_private.is_staff(auth.uid()))));
alter policy workout_exercises_staff_write on public.workout_exercises using(app_private.is_staff(auth.uid())) with check(app_private.is_staff(auth.uid()));
alter policy sessions_owner on public.workout_sessions using(user_id=auth.uid() or app_private.is_staff(auth.uid())) with check(user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy protocols_read on public.protocols using(user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy protocols_staff_write on public.protocols using(app_private.is_staff(auth.uid())) with check(app_private.is_staff(auth.uid()));
alter policy crm_owner_read on public.crm_events using(user_id=auth.uid() or app_private.is_staff(auth.uid()));
alter policy crm_owner_insert on public.crm_events with check(user_id=auth.uid() or app_private.is_staff(auth.uid()));

drop function public.set_updated_at();
drop function public.has_role(uuid,public.app_role);
drop function public.is_staff(uuid);
drop function public.handle_new_user();