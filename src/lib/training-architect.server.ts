import { Output, streamText } from "ai";
import { z } from "zod";
import { SIM_TRAINING_SPEC_V1 } from "@/lib/training-spec.server";

const exerciseSchema = z.object({ exercise_id:z.string().uuid(),raw_name:z.string(),order:z.number(),sets:z.number(),rep_min:z.number().nullable(),rep_max:z.number().nullable(),reps:z.string(),target_effort_type:z.enum(["RPE","RIR"]),target_effort:z.number().nullable(),rest_seconds:z.number(),tempo:z.string().nullable(),execution_notes:z.string(),load:z.number().nullable(),pain_rule:z.string(),video_reference:z.string().nullable(),reason_for_inclusion:z.string(),priority_relation:z.string(),alternatives:z.array(z.string()) });
const workoutSchema = z.object({ name:z.string(),objective:z.string(),estimated_minutes:z.number(),variant_type:z.enum(["MAIN_WORKOUT","HOME_OR_LIMITED_EQUIPMENT","TRAVEL_WORKOUT","EMERGENCY_20_MIN","OPTIONAL_30_MIN","OPTIONAL_40_MIN","STANDARD_SESSION"]),notes:z.string(),exercises:z.array(exerciseSchema) });
export const trainingArchitectSchema = z.object({ program_name:z.string(),primary_goal:z.string(),why_this_plan:z.string(),strategy_summary:z.string(),decision_summary:z.string(),evidence_used:z.array(z.string()),cycle_priorities:z.array(z.object({priority:z.string(),reason:z.string(),evidence:z.string()})),weekly_structure:z.string(),workouts:z.array(workoutSchema),progression_rules:z.array(z.string()),contingency_plan:z.array(z.string()),minimum_week:z.string(),travel_variation:z.string().nullable(),review_triggers:z.array(z.string()) });

const principles = `Você é o Training Architect do Shape Is Money. Siga a SIM TRAINING INTELLIGENCE SPEC v1.0.
DADO → EVIDÊNCIA → INTERPRETAÇÃO → PRIORIDADE → DECISÃO → PRESCRIÇÃO → EXECUÇÃO → RESPOSTA → REAVALIAÇÃO.
Responda primeiro qual decisão o cliente precisa agora e depois qual treino materializa essa decisão. Use somente exercícios da biblioteca. Justifique ordem, volume, frequência, recuperação e aderência. Inclua semana mínima, contingência e viagem quando aplicável. Sinais RED interrompem a decisão e exigem revisão humana. Nunca diagnostique, prescreva medicamentos ou hormônios. Gere apenas draft editável; nunca aprove ou publique.`;

export async function buildTrainingEvidenceBundle(input:{admin:any;clientId:string;cycleId?:string}) {
  const { admin, clientId } = input;
  const cycleQuery = admin.from("cycle_strategies").select("*,cycle_priorities(*)").eq("client_id",clientId).in("status",["draft","active"]).order("created_at",{ascending:false}).limit(1);
  const [profile,onboarding,anamnesis,analysis,score,cycle,assessment,photos,perception,checkins,reviews,sessions,pain,habits,library,knowledge]=await Promise.all([
    admin.from("profiles").select("first_name,last_name,profession,company,job_title,plan").eq("id",clientId).single(),
    admin.from("onboarding_responses").select("responses,completed_at").eq("user_id",clientId).maybeSingle(),
    admin.from("client_anamnesis").select("id,version,status,sections,completed_at").eq("client_id",clientId).eq("status","completed").order("version",{ascending:false}).limit(1).maybeSingle(),
    admin.from("anamnesis_analyses").select("*").eq("client_id",clientId).eq("status","completed").order("completed_at",{ascending:false}).limit(1).maybeSingle(),
    admin.from("sim_scores").select("*").eq("user_id",clientId).order("created_at",{ascending:false}).limit(1).maybeSingle(),
    input.cycleId ? admin.from("cycle_strategies").select("*,cycle_priorities(*)").eq("id",input.cycleId).eq("client_id",clientId).single() : cycleQuery.maybeSingle(),
    admin.from("assessments").select("*").eq("client_id",clientId).eq("status","approved").order("approved_at",{ascending:false}).limit(1).maybeSingle(),
    admin.from("assessment_photos").select("slot_id,captured_at,version").eq("client_id",clientId),
    admin.from("perception_scans").select("summary,priority,next_action,coherence_score,status,created_at").eq("user_id",clientId).in("status",["ai_completed","reviewed"]).order("created_at",{ascending:false}).limit(1).maybeSingle(),
    admin.from("daily_checkins").select("*").eq("user_id",clientId).order("checkin_date",{ascending:false}).limit(14),
    admin.from("weekly_reviews").select("*").eq("user_id",clientId).order("week_start",{ascending:false}).limit(8),
    admin.from("workout_sessions").select("*").eq("user_id",clientId).order("started_at",{ascending:false}).limit(30),
    admin.from("pain_reports").select("*").eq("user_id",clientId).order("created_at",{ascending:false}).limit(10),
    admin.from("client_habits").select("*,habit_logs(*)").eq("client_id",clientId).in("status",["active","completed"]),
    admin.from("exercise_library").select("id,name,aliases,movement_pattern,primary_muscles,equipment,equipment_options,difficulty,stability_requirement,mobility_requirement,fatigue_cost,joint_considerations,red_flags,regressions,progressions,alternatives").eq("active",true),
    admin.from("training_knowledge_documents").select("title,version,content,document_type").eq("active",true).order("is_primary",{ascending:false}),
  ]);
  const redFlags=(pain.data??[]).filter((item:any)=>item.classification==="RED"&&item.status!=="closed");
  const safetyLevel=redFlags.length?"RED":analysis.data?.safety_level??"YELLOW";
  const readiness=analysis.data?.readiness&&typeof analysis.data.readiness==="object"?analysis.data.readiness:{};
  return {
    profile:profile.data,
    anamnesis:anamnesis.data??{sections:onboarding.data?.responses??{},status:onboarding.data?.completed_at?"completed":"draft"},
    analysis:analysis.data,
    sim_score:score.data,
    cycle:cycle.data,
    assessment:assessment.data,
    photo_protocol:{captured:new Set((photos.data??[]).map((item:any)=>item.slot_id)).size,versions:photos.data??[]},
    perception:perception.data,
    recent_checkins:checkins.data??[],weekly_reviews:reviews.data??[],training_history:sessions.data??[],
    pain_and_restrictions:pain.data??[],habits:habits.data??[],exercise_library:library.data??[],knowledge_base:knowledge.data??[],
    safety:{level:safetyLevel,blocked:safetyLevel==="RED",red_flags:redFlags},
    readiness,
  };
}

export async function generateTrainingDraftCore(input:{ clientId:string; cycleId:string; actorId:string; admin:any }) {
  const { clientId, cycleId, actorId, admin } = input;
  const key=process.env['LOVABLE_API_KEY']; if(!key) throw new Error("Training Intelligence não está configurado.");
  const evidence=await buildTrainingEvidenceBundle({admin,clientId,cycleId});
  if(!evidence.profile||!evidence.cycle||!evidence.anamnesis||!evidence.analysis) throw new Error("Dados essenciais de perfil, anamnese analisada ou ciclo não encontrados.");
  if(evidence.safety.blocked) throw new Error("Geração bloqueada por sinal de saúde que exige revisão humana.");
  const { createTrainingArchitectModel }=await import("@/lib/ai-gateway.server");
  const result=streamText({model:createTrainingArchitectModel(key),instructions:`${principles}\n\nMETODOLOGIA OFICIAL INTEGRAL:\n${SIM_TRAINING_SPEC_V1}`,prompt:`Crie o draft completo usando exclusivamente exercise_id existentes na biblioteca fornecida. O raw_name é apenas legível; exercise_id é a identidade obrigatória. Se não houver opção segura e adequada, não invente IDs nem exercícios. Contexto:\n${JSON.stringify(evidence)}`,output:Output.object({schema:trainingArchitectSchema,name:"training_draft"}),providerOptions:{openai:{forceReasoning:true,reasoningEffort:"medium",reasoningSummary:"auto",store:false,include:["reasoning.encrypted_content"]}}});
  const draft=await result.output;
  const libraryIds=new Set((evidence.exercise_library??[]).map((item:any)=>item.id as string));
  const missing=draft.workouts.flatMap(workout=>workout.exercises).filter(exercise=>!libraryIds.has(exercise.exercise_id)).map(exercise=>exercise.raw_name);
  if(missing.length)throw new Error(`NEEDS_LIBRARY:${[...new Set(missing)].join(" | ")}`);
  const {data:program,error}=await admin.from("workout_programs").insert({user_id:clientId,cycle_id:cycleId,title:draft.program_name,objective:draft.primary_goal,primary_goal:draft.primary_goal,why_this_plan:draft.why_this_plan,notes:draft.strategy_summary,creation_source:"AI_DRAFT",status:"draft",created_by:actorId,starts_on:evidence.cycle.start_date,ends_on:evidence.cycle.target_date}).select("id").single();
  if(error||!program) throw error??new Error("Não foi possível salvar o draft.");
  for(const [sequence,workout] of draft.workouts.entries()){
    const {data:workoutRow}=await admin.from("workouts").insert({program_id:program.id,name:workout.name,objective:workout.objective,estimated_minutes:workout.estimated_minutes,variant_type:workout.variant_type,notes:workout.notes,sequence}).select("id").single();
    if(!workoutRow)continue;
    const rows=workout.exercises.map((exercise,exerciseSequence)=>({workout_id:workoutRow.id,exercise_id:exercise.exercise_id,sequence:exerciseSequence,sets:exercise.sets,reps:exercise.reps,rep_min:exercise.rep_min,rep_max:exercise.rep_max,target_effort_type:exercise.target_effort_type,target_effort:exercise.target_effort,rest_seconds:exercise.rest_seconds,tempo:exercise.tempo,execution_notes:exercise.execution_notes,initial_load:exercise.load,pain_rule:exercise.pain_rule,video_reference:exercise.video_reference,reason_for_inclusion:exercise.reason_for_inclusion,priority_relation:exercise.priority_relation,evidence_relation:[]}));
    if(rows.length)await admin.from("workout_exercises").insert(rows);
  }
  await admin.from("training_decisions").insert({client_id:clientId,cycle_id:cycleId,program_id:program.id,decision_type:"TRAINING_ARCHITECT_DRAFT",decision:draft.decision_summary,reason:draft.strategy_summary,evidence_ids:draft.evidence_used,confidence:0.7,author_type:"AI",author_id:actorId,approval_status:"pending",ai_original:draft});
  return {programId:program.id,draft};
}
