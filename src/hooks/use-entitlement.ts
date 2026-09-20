import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useEntitlement(feature: string) {
  const [state, setState] = useState({ loading: true, enabled: false });
  useEffect(() => {
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return setState({ loading: false, enabled: false });
      const { data: profile } = await supabase.from("profiles").select("plan").eq("id", userData.user.id).maybeSingle();
      if (!profile) return setState({ loading: false, enabled: false });
      const { data } = await supabase.from("plan_entitlements").select("enabled").eq("plan", profile.plan).eq("feature_key", feature).maybeSingle();
      setState({ loading: false, enabled: data?.enabled === true });
    })();
  }, [feature]);
  return state;
}