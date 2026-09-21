import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole=Database["public"]["Enums"]["app_role"];
export type Capability="member_ecosystem"|"admin_cockpit"|"client_portfolio"|"relationship"|"training"|"nutrition"|"perception"|"content"|"reports"|"settings";
export const STAFF_ROLES:AppRole[]=["coach","nutritionist","nutrition","support","manager","admin","admin_master","content","analyst","relationship","specialist"];
const matrix:Record<Capability,AppRole[]>={
 member_ecosystem:["student","member","beta_member","admin_master"],admin_cockpit:["coach","nutritionist","nutrition","support","manager","admin","admin_master","content","analyst","relationship","specialist"],client_portfolio:["coach","nutritionist","nutrition","manager","admin","admin_master","relationship","specialist"],relationship:["coach","support","manager","admin","admin_master","relationship","specialist"],training:["coach","manager","admin","admin_master","specialist"],nutrition:["nutritionist","nutrition","manager","admin","admin_master","specialist"],perception:["coach","manager","admin","admin_master","specialist"],content:["content","manager","admin","admin_master"],reports:["manager","admin","admin_master","analyst"],settings:["admin_master"]};
export const PermissionService={
 has(roles:AppRole[],capability:Capability){return roles.includes("admin_master")||matrix[capability].some(role=>roles.includes(role));},
 isStaff(roles:AppRole[]){return roles.some(role=>STAFF_ROLES.includes(role));},
 isBeta(roles:AppRole[]){return roles.includes("beta_member")||roles.includes("admin_master");},
 async current(){const{data:user}=await supabase.auth.getUser();if(!user.user)return{user:null,roles:[] as AppRole[],isStaff:false,isBeta:false};const{data}=await supabase.from("user_roles").select("role").eq("user_id",user.user.id);const roles=(data??[]).map(x=>x.role);return{user:user.user,roles,isStaff:this.isStaff(roles),isBeta:this.isBeta(roles)};}
};
