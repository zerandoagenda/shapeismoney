import { createServerFn } from "@tanstack/react-start";
import { Output, streamText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const parsedExerciseSchema = z.object({
  raw_name: z.string(), order: z.number(), sets: z.number(), rep_min: z.number().nullable(), rep_max: z.number().nullable(), reps: z.string(),
  target_effort_type: z.enum(["RPE", "RIR"]), target_effort: z.number().nullable(), rest_seconds: z.number(), tempo: z.string().nullable(),
  execution_notes: z.string(), load: z.number().nullable(), pain_rule: z.string(), video_reference: z.string().nullable(),
  reason_for_inclusion: z.string(), priority_relation: z.string(), alternatives: z.array(z.string()),
});
const parsedWorkoutSchema = z.object({ name: z.string(), objective: z.string(), estimated_minutes: z.number(), variant_type: z.enum(["MAIN_WORKOUT","HOME_OR_LIMITED_EQUIPMENT","TRAVEL_WORKOUT","EMERGENCY_20_MIN","OPTIONAL_30_MIN","OPTIONAL_40_MIN","STANDARD_SESSION"]), notes: z.string(), exercises: z.array(parsedExerciseSchema) });
const planSchema = z.object({ program_name: z.string(), primary_goal: z.string(), why_this_plan: z.string(), strategy_summary: z.string(), workouts: z.array(parsedWorkoutSchema) });
const architectSchema = planSchema.extend({
  decision_summary: z.string(),
  evidence_used: z.array(z.string()),
  cycle_priorities: z.array(z.object({ priority: z.string(), reason: z.string(), evidence: z.string() })),
  weekly_structure: z.string(),
  progression_rules: z.array(z.string()),
  contingency_plan: z.array(z.string()),
  minimum_week: z.string(),
  travel_variation: z.string().nullable(),
  review_triggers: z.array(z.string()),
});
const aiOptions = { openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } } as const;

async function requireStaff(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  if (!data?.some((row: { role: string }) => ["coach","manager","admin","admin_master"].includes(row.role))) throw new Error("Acesso restrito à equipe de treino.");
}

async function modelForRequest() {
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) throw new Error("Training Intelligence não está configurado.");
  const { createTrainingArchitectModel } = await import("@/lib/ai-gateway.server");
  return createTrainingArchitectModel(key);
}

const trainingPrinciples = `Você é o Training Architect do Shape Is Money. Siga a SIM TRAINING INTELLIGENCE SPEC v1.0 como regra operacional, não como referência superficial.
ORDEM OBRIGATÓRIA: DADO → EVIDÊNCIA → INTERPRETAÇÃO → PRIORIDADE → DECISÃO → PRESCRIÇÃO → EXECUÇÃO → RESPOSTA → REAVALIAÇÃO. Responda primeiro qual decisão o cliente precisa agora e depois qual treino materializa a decisão.
PRESCRIÇÃO: justifique ordem, volume, frequência, recuperação e aderência; use somente exercícios da biblioteca; detalhe progressão e regressão; custo de fadiga; cardio e mobilidade quando sustentados por evidência.
CONTEXTOS: sempre defina semana mínima, contingência para semana crítica e variação de viagem quando aplicável. Use check-ins, execução anterior, dor e reavaliação como gatilhos, sem recriar treino por uma semana ruim isolada.
DOR: sinais GREEN permitem continuidade observada; YELLOW exige ajuste conservador e revisão humana; RED interrompe a decisão de treino e encaminha para revisão humana. Nunca diagnostique nem tome decisão clínica.
AUTONOMIA: nível 2. Gere somente draft editável; nunca aprove ou publique. Registre evidências, prioridades, razões por exercício e gatilhos de revisão.
TOM: direto, preciso, executivo, sem promessas, causalidade inventada, medicamento ou hormônio.`;

export const parseTrainingPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ importId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const { data: item } = await context.supabase.from("training_imports").select("*").eq("id", data.importId).single();
    if (!item) throw new Error("Importação não encontrada.");
    await context.supabase.from("training_imports").update({ status: "parsing", error_message: null }).eq("id", item.id);
    try {
      if (!item.storage_path || !item.mime_type) throw new Error("Arquivo PDF indisponível.");
      const { data: file, error } = await context.supabase.storage.from("training-private").download(item.storage_path);
      if (error) throw error;
      const model = await modelForRequest();
      const result = streamText({
        model,
        instructions: `${trainingPrinciples}\nExtraia fielmente o PDF. Não substitua nomes desconhecidos. Preserve carga, tempo, cardio, mobilidade, observações e alternativas quando existirem.`,
        messages: [{ role: "user", content: [{ type: "text", text: "Estruture este PDF de treino individual para revisão. Retorne todos os campos, usando texto vazio ou null quando ausentes." }, { type: "file", data: new Uint8Array(await file.arrayBuffer()), mediaType: item.mime_type, filename: item.original_filename ?? "treino.pdf" }] }],
        output: Output.object({ schema: planSchema, name: "training_pdf" }), providerOptions: aiOptions,
      });
      const parsed = await result.output;
      const { data: library } = await context.supabase.from("exercise_library").select("id,name,aliases").eq("active", true);
      const normalized = new Map<string,string>();
      for (const exercise of library ?? []) for (const name of [exercise.name, ...(exercise.aliases ?? [])]) normalized.set(name.trim().toLocaleLowerCase("pt-BR"), exercise.id);
      const payload = { ...parsed, workouts: parsed.workouts.map(workout => ({ ...workout, exercises: workout.exercises.map(exercise => ({ ...exercise, matched_exercise_id: normalized.get(exercise.raw_name.trim().toLocaleLowerCase("pt-BR")) ?? null })) })) };
      await context.supabase.from("training_imports").update({ status: "review", parsed_payload: payload }).eq("id", item.id);
      await context.supabase.from("crm_events").insert({ user_id: item.client_id, event_type: "training.imported_pdf", metadata: { import_id: item.id } });
      return payload;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 300) : "Não foi possível interpretar o PDF.";
      await context.supabase.from("training_imports").update({ status: "failed", error_message: message }).eq("id", item.id);
      throw new Error(message);
    }
  });

export const parseTrainingText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ importId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const { data: item } = await context.supabase.from("training_imports").select("*").eq("id", data.importId).single();
    if (!item?.source_text) throw new Error("Texto de treino não encontrado.");
    await context.supabase.from("training_imports").update({ status: "parsing", error_message: null }).eq("id", item.id);
    try {
      const model = await modelForRequest();
      const result = streamText({
        model,
        instructions: `${trainingPrinciples}\nEstruture fielmente o texto recebido. Não substitua nomes desconhecidos, não invente séries, cargas ou equivalências.`,
        prompt: `Converta o texto abaixo em um programa estruturado para revisão humana. Use texto vazio ou null quando o dado não existir:\n\n${item.source_text}`,
        output: Output.object({ schema: planSchema, name: "training_text" }),
        providerOptions: aiOptions,
      });
      const parsed = await result.output;
      const { data: library } = await context.supabase.from("exercise_library").select("id,name,aliases").eq("active", true);
      const normalized = new Map<string,string>();
      for (const exercise of library ?? []) for (const name of [exercise.name, ...(exercise.aliases ?? [])]) normalized.set(name.trim().toLocaleLowerCase("pt-BR"), exercise.id);
      const payload = { ...parsed, workouts: parsed.workouts.map(workout => ({ ...workout, exercises: workout.exercises.map(exercise => ({ ...exercise, matched_exercise_id: normalized.get(exercise.raw_name.trim().toLocaleLowerCase("pt-BR")) ?? null })) })) };
      await context.supabase.from("training_imports").update({ status: "review", parsed_payload: payload, extracted_text: item.source_text }).eq("id", item.id);
      await context.supabase.from("crm_events").insert({ user_id: item.client_id, event_type: "training.imported_text", metadata: { import_id: item.id } });
      return payload;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 300) : "Não foi possível interpretar o texto.";
      await context.supabase.from("training_imports").update({ status: "failed", error_message: message }).eq("id", item.id);
      throw new Error(message);
    }
  });

export const generateTrainingDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ clientId: z.string().uuid(), cycleId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const [profile, onboarding, score, cycle, checkins, reviews, sessions, library, knowledge] = await Promise.all([
      context.supabase.from("profiles").select("first_name,last_name,profession,company").eq("id",data.clientId).single(),
      context.supabase.from("onboarding_responses").select("responses").eq("user_id",data.clientId).maybeSingle(),
      context.supabase.from("sim_scores").select("*").eq("user_id",data.clientId).order("created_at",{ascending:false}).limit(1).maybeSingle(),
      context.supabase.from("cycle_strategies").select("*,cycle_priorities(*)").eq("id",data.cycleId).eq("client_id",data.clientId).single(),
      context.supabase.from("daily_checkins").select("*").eq("user_id",data.clientId).order("checkin_date",{ascending:false}).limit(14),
      context.supabase.from("weekly_reviews").select("*").eq("user_id",data.clientId).order("week_start",{ascending:false}).limit(8),
      context.supabase.from("workout_sessions").select("*").eq("user_id",data.clientId).order("started_at",{ascending:false}).limit(30),
      context.supabase.from("exercise_library").select("id,name,movement_pattern,primary_muscles,equipment,difficulty,stability_requirement,mobility_requirement,fatigue_cost,joint_considerations,red_flags,regressions,progressions,alternatives").eq("active",true),
      context.supabase.from("training_knowledge_documents").select("title,version,content,document_type").eq("active",true).order("is_primary",{ascending:false}),
    ]);
    if (!profile.data || !cycle.data) throw new Error("Cliente ou ciclo não encontrado.");
    const model = await modelForRequest();
    const evidence = { profile: profile.data, onboarding: onboarding.data?.responses ?? {}, sim_score: score.data, cycle: cycle.data, recent_checkins: checkins.data ?? [], weekly_reviews: reviews.data ?? [], previous_training: sessions.data ?? [], exercise_library: library.data ?? [], knowledge_base: knowledge.data ?? [] };
    const result = streamText({ model, instructions: trainingPrinciples, prompt: `Crie o draft completo exigido pela metodologia. Use exclusivamente nomes da biblioteca fornecida. Cada exercício precisa de rationale em reason_for_inclusion e ligação explícita à prioridade/evidência. Contexto completo:\n${JSON.stringify(evidence)}`, output: Output.object({ schema: architectSchema, name: "training_draft" }), providerOptions: aiOptions });
    const draft = await result.output;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: program, error: programError } = await supabaseAdmin.from("workout_programs").insert({ user_id:data.clientId, cycle_id:data.cycleId, title:draft.program_name, objective:draft.primary_goal, primary_goal:draft.primary_goal, why_this_plan:draft.why_this_plan, notes:draft.strategy_summary, creation_source:"AI_DRAFT", status:"draft", created_by:context.userId, starts_on:cycle.data.start_date, ends_on:cycle.data.target_date }).select("id").single();
    if (programError || !program) throw programError ?? new Error("Não foi possível salvar o draft.");
    const libraryByName = new Map((library.data ?? []).map((item: any) => [item.name.trim().toLocaleLowerCase("pt-BR"), item.id]));
    for (const [sequence, workout] of draft.workouts.entries()) {
      const { data: workoutRow } = await supabaseAdmin.from("workouts").insert({ program_id:program.id,name:workout.name,objective:workout.objective,estimated_minutes:workout.estimated_minutes,variant_type:workout.variant_type,notes:workout.notes,sequence }).select("id").single();
      if (!workoutRow) continue;
      const rows = workout.exercises.flatMap((exercise, exerciseSequence) => { const exerciseId=libraryByName.get(exercise.raw_name.trim().toLocaleLowerCase("pt-BR")); return exerciseId ? [{ workout_id:workoutRow.id,exercise_id:exerciseId,sequence:exerciseSequence,sets:exercise.sets,reps:exercise.reps,rep_min:exercise.rep_min,rep_max:exercise.rep_max,target_effort_type:exercise.target_effort_type,target_effort:exercise.target_effort,rest_seconds:exercise.rest_seconds,tempo:exercise.tempo,execution_notes:exercise.execution_notes,initial_load:exercise.load,pain_rule:exercise.pain_rule,video_reference:exercise.video_reference,reason_for_inclusion:exercise.reason_for_inclusion,priority_relation:exercise.priority_relation,evidence_relation:[] }] : []; });
      if (rows.length) await supabaseAdmin.from("workout_exercises").insert(rows);
    }
    await supabaseAdmin.from("training_decisions").insert({ client_id:data.clientId,cycle_id:data.cycleId,program_id:program.id,decision_type:"TRAINING_ARCHITECT_DRAFT",decision:draft.why_this_plan,reason:draft.strategy_summary,evidence_ids:[],confidence:0.7,author_type:"AI",author_id:context.userId,approval_status:"pending",ai_original:draft });
    await supabaseAdmin.from("crm_events").insert({ user_id:data.clientId,event_type:"training.draft_generated",metadata:{program_id:program.id,cycle_id:data.cycleId} });
    return { programId: program.id, draft };
  });

export const mapImportedExercise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ importId: z.string().uuid(), rawName: z.string().min(1), exerciseId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const { data: item } = await context.supabase.from("training_imports").select("parsed_payload").eq("id",data.importId).single();
    const { data: exercise } = await context.supabase.from("exercise_library").select("aliases").eq("id",data.exerciseId).single();
    if(!item||!exercise) throw new Error("Importação ou exercício não encontrado.");
    const aliases=Array.from(new Set([...(exercise.aliases??[]),data.rawName]));
    await context.supabase.from("exercise_library").update({aliases}).eq("id",data.exerciseId);
    const payload=item.parsed_payload as z.infer<typeof planSchema> & {workouts:Array<{exercises:Array<Record<string,unknown>&{raw_name:string}>}>};
    const mapped={...payload,workouts:payload.workouts.map(workout=>({...workout,exercises:workout.exercises.map(entry=>entry.raw_name===data.rawName?{...entry,matched_exercise_id:data.exerciseId}:entry)}))};
    await context.supabase.from("training_imports").update({parsed_payload:mapped}).eq("id",data.importId);
    return mapped;
  });

export const saveImportedTrainingDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ importId: z.string().uuid(), cycleId: z.string().uuid(), payload: planSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: item } = await supabaseAdmin.from("training_imports").select("*").eq("id", data.importId).single();
    if (!item) throw new Error("Importação não encontrada.");
    const creationSource=item.import_source==="TEXT_IMPORT"?"TEXT_IMPORT":"PDF_IMPORT";
    const { data: program, error } = await supabaseAdmin.from("workout_programs").insert({ user_id:item.client_id,cycle_id:data.cycleId,title:data.payload.program_name,objective:data.payload.primary_goal,primary_goal:data.payload.primary_goal,why_this_plan:data.payload.why_this_plan,notes:data.payload.strategy_summary,creation_source:creationSource,status:"draft",created_by:context.userId }).select("id").single();
    if (error || !program) throw error ?? new Error("Não foi possível salvar o programa.");
    const { data: library } = await supabaseAdmin.from("exercise_library").select("id,name,aliases").eq("active",true);
    const names=new Map<string,string>();for(const entry of library??[])for(const name of[entry.name,...(entry.aliases??[])])names.set(name.trim().toLocaleLowerCase("pt-BR"),entry.id);
    for(const [sequence,workout] of data.payload.workouts.entries()){
      const{data:workoutRow}=await supabaseAdmin.from("workouts").insert({program_id:program.id,name:workout.name,objective:workout.objective,estimated_minutes:workout.estimated_minutes,variant_type:workout.variant_type,notes:workout.notes,sequence}).select("id").single();
      if(!workoutRow)continue;
      const unmatched:string[]=[];const rows=workout.exercises.flatMap((exercise,exerciseSequence)=>{const exerciseId=names.get(exercise.raw_name.trim().toLocaleLowerCase("pt-BR"));if(!exerciseId){unmatched.push(exercise.raw_name);return[];}return[{workout_id:workoutRow.id,exercise_id:exerciseId,sequence:exerciseSequence,sets:exercise.sets,reps:exercise.reps,rep_min:exercise.rep_min,rep_max:exercise.rep_max,target_effort_type:exercise.target_effort_type,target_effort:exercise.target_effort,rest_seconds:exercise.rest_seconds,tempo:exercise.tempo,execution_notes:exercise.execution_notes,initial_load:exercise.load,pain_rule:exercise.pain_rule,video_reference:exercise.video_reference,reason_for_inclusion:exercise.reason_for_inclusion,priority_relation:exercise.priority_relation,evidence_relation:[]}];});
      if(unmatched.length)throw new Error(`UNMATCHED EXERCISE: ${unmatched.join(", ")}. Faça o mapeamento antes de salvar.`);
      if(rows.length)await supabaseAdmin.from("workout_exercises").insert(rows);
    }
    await supabaseAdmin.from("training_imports").update({status:"saved",program_id:program.id,parsed_payload:data.payload}).eq("id",item.id);
    await supabaseAdmin.from("training_decisions").insert({client_id:item.client_id,cycle_id:data.cycleId,program_id:program.id,decision_type:`${creationSource}_REVIEWED`,decision:data.payload.why_this_plan,reason:data.payload.strategy_summary,author_type:"COACH",author_id:context.userId,approval_status:"pending",final_version:data.payload,evidence_ids:[data.importId]});
    return {programId:program.id};
  });