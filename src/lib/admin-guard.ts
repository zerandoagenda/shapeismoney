import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PermissionService } from "@/lib/permissions";

export async function requireStaff() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw redirect({ to: "/auth" });
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
  if (!PermissionService.isStaff((data??[]).map(entry=>entry.role))) throw redirect({ to: "/dashboard" });
  return { user: userData.user };
}