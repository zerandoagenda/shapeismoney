CREATE OR REPLACE FUNCTION app_private.audit_training_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,app_private AS $$
DECLARE
  row_data jsonb;
  subject uuid;
  entity uuid;
BEGIN
  row_data := CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  entity := (row_data->>'id')::uuid;
  subject := NULLIF(row_data->>'client_id','')::uuid;
  IF subject IS NULL THEN subject := NULLIF(row_data->>'user_id','')::uuid; END IF;
  IF subject IS NULL AND row_data ? 'cycle_id' THEN SELECT client_id INTO subject FROM public.cycle_strategies WHERE id=NULLIF(row_data->>'cycle_id','')::uuid; END IF;
  IF auth.uid() IS NOT NULL AND app_private.is_staff(auth.uid()) THEN
    INSERT INTO public.admin_audit_log(actor_id,action,entity_type,entity_id,client_id,metadata)
    VALUES(auth.uid(),TG_TABLE_NAME || '.' || lower(TG_OP),TG_TABLE_NAME,entity,subject,jsonb_build_object('operation',TG_OP));
  END IF;
  RETURN COALESCE(NEW,OLD);
END $$;

CREATE TRIGGER audit_cycle_strategies AFTER INSERT OR UPDATE OR DELETE ON public.cycle_strategies FOR EACH ROW EXECUTE FUNCTION app_private.audit_training_change();
CREATE TRIGGER audit_cycle_priorities AFTER INSERT OR UPDATE OR DELETE ON public.cycle_priorities FOR EACH ROW EXECUTE FUNCTION app_private.audit_training_change();
CREATE TRIGGER audit_training_decisions AFTER INSERT OR UPDATE OR DELETE ON public.training_decisions FOR EACH ROW EXECUTE FUNCTION app_private.audit_training_change();
CREATE TRIGGER audit_training_imports AFTER INSERT OR UPDATE OR DELETE ON public.training_imports FOR EACH ROW EXECUTE FUNCTION app_private.audit_training_change();
CREATE TRIGGER audit_pain_reports AFTER INSERT OR UPDATE OR DELETE ON public.pain_reports FOR EACH ROW EXECUTE FUNCTION app_private.audit_training_change();
CREATE TRIGGER audit_assessments AFTER INSERT OR UPDATE OR DELETE ON public.assessments FOR EACH ROW EXECUTE FUNCTION app_private.audit_training_change();
CREATE TRIGGER audit_technique_videos AFTER INSERT OR UPDATE OR DELETE ON public.technique_videos FOR EACH ROW EXECUTE FUNCTION app_private.audit_training_change();
CREATE TRIGGER audit_training_knowledge AFTER INSERT OR UPDATE OR DELETE ON public.training_knowledge_documents FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_content_change();
CREATE TRIGGER audit_photo_protocol_slots AFTER INSERT OR UPDATE OR DELETE ON public.photo_protocol_slots FOR EACH ROW EXECUTE FUNCTION app_private.audit_admin_content_change();