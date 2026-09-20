import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const staffRoles = ["coach", "nutritionist", "support", "manager", "admin", "admin_master"];

export async function requireStaff() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw redirect({ to: "/auth" });
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
  if (!data?.some((entry) => staffRoles.includes(entry.role))) throw redirect({ to: "/dashboard" });
  return { user: userData.user };
}