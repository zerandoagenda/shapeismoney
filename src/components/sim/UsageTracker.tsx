import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
type Event="open"|"view"|"start"|"complete"|"click";
export function UsageTracker({module,event="open",entityId}:{module:string;event?:Event;entityId?:string}){useEffect(()=>{void(async()=>{const{data}=await supabase.auth.getUser();if(data.user)await supabase.from("product_usage_events").insert({user_id:data.user.id,module,event_type:event,entity_id:entityId??null})})()},[module,event,entityId]);return null}
