import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ContextType = "training" | "nutrition" | "habit" | "checkin" | "perception" | "general";
type Comment = { id:string;author_id:string;message:string;status:string;created_at:string };

export function TeamConversation({ contextType, contextId }: { contextType: ContextType; contextId?: string | null }) {
  const [comments,setComments]=useState<Comment[]>([]);const[message,setMessage]=useState("");const[saving,setSaving]=useState(false);
  const load=useCallback(async()=>{const{data:auth}=await supabase.auth.getUser();if(!auth.user)return;let query=supabase.from("contextual_comments").select("id,author_id,message,status,created_at").eq("client_id",auth.user.id).eq("context_type",contextType).order("created_at");if(contextId)query=query.eq("context_id",contextId);else query=query.is("context_id",null);const{data}=await query;setComments(data??[])},[contextId,contextType]);
  useEffect(()=>{void load()},[load]);
  async function send(){if(!message.trim())return;setSaving(true);const{data:auth}=await supabase.auth.getUser();if(!auth.user){setSaving(false);return}const{error}=await supabase.from("contextual_comments").insert({client_id:auth.user.id,author_id:auth.user.id,context_type:contextType,context_id:contextId??null,message:message.trim()});if(error)toast.error("Não foi possível enviar sua mensagem.");else{setMessage("");toast.success("Mensagem enviada à equipe.");await load()}setSaving(false)}
  return <section className="border-t border-border pt-8"><div className="flex items-center gap-3"><MessageSquare className="size-4 text-primary"/><div><p className="sim-kicker">Conversa privada</p><h2 className="mt-1 text-2xl">Falar com a equipe</h2></div></div>{comments.length>0&&<div className="mt-5 divide-y divide-border border-y border-border">{comments.map(item=><div key={item.id} className="py-4"><p className="text-sm leading-6">{item.message}</p><p className="mt-2 text-[9px] uppercase text-muted-foreground">{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(item.created_at))} · {item.status}</p></div>)}</div>}<Textarea className="mt-5 min-h-24 rounded-none" value={message} onChange={event=>setMessage(event.target.value)} placeholder="Escreva uma dúvida ou contexto para a equipe"/><Button variant="quiet" className="mt-3" disabled={saving||!message.trim()} onClick={()=>void send()}><Send/>{saving?"Enviando…":"Enviar mensagem"}</Button></section>;
}