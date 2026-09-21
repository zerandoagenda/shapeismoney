import { Output, streamText } from "ai";
import { z } from "zod";

const exerciseSchema = z.object({ raw_name:z.string(),order:z.number(),sets:z.number(),rep_min:z.number().nullable(),rep_max:z.number().nullable(),reps:z.string(),target_effort_type:z.enum(["RPE","RIR"]),target_effort:z.number().nullable(),rest_seconds:z.number(),tempo:z.string().nullable(),execution_notes:z.string(),load:z.number().nullable(),pain_rule:z.string(),video_reference:z.string().nullable(),reason_for_inclusion:z.string(),priority_relation:z.string(),alternatives:z.array(z.string()) });
const workoutSchema = z.object({ name:z.string(),objective:z.string(),estimated_minutes:z.number(),variant_type:z.enum(["MAIN_WORKOUT","HOME_OR_LIMITED_EQUIPMENT","TRAVEL_WORKOUT","EMERGENCY_20_MIN","OPTIONAL_30_MIN","OPTIONAL_40_MIN","STANDARD_SESSION"]),notes:z.string(),exercises:z.array(exerciseSchema) });
export const trainingArchitectSchema = z.object({ program_name:z.string(),primary_goal:z.string(),why_this_plan:z.string(),strategy_summary:z.string(),decision_summary:z.string(),evidence_used:z.array(z.string()),cycle_priorities:z.array(z.object({priority:z.string(),reason:z.string(),evidence:z.string()})),weekly_structure:z.string(),workouts:z.array(workoutSchema),progression_rules:z.array(z.string()),contingency_plan:z.array(z.string()),minimum_week:z.string(),travel_variation:z.string().nullable(),review_triggers:z.array(z.string()) });

const principles = `Você é o Training Architect do Shape Is Money. Siga a SIM TRAINING INTELLIGENCE SPEC v1.0.
DADO → EVIDÊNCIA → INTERPRETAÇÃO → PRIORIDADE → DECISÃO → PRESCRIÇÃO → EXECUÇÃO → RESPOSTA → REAVALIAÇÃO.
Responda primeiro qual decisão o cliente precisa agora e depois qual treino materializa essa decisão. Use somente exercícios da biblioteca. Justifique ordem, volume, frequência, recuperação e aderência. Inclua semana mínima, contingência e viagem quando aplicável. Sinais RED interrompem a decisão e exigem revisão humana. Nunca diagnostique, prescreva medicamentos ou hormônios. Gere apenas draft editável; nunca aprove ou publique.`;

export async function generateTrainingDraftCore(input:{ clientId:string; cycleId:string; actorId:string; admin:any }) {
  const { clientId, cycleId, actorId, admin } = input;
  const key=process.env['LOVABLE_API_KEY']; if(!key) throw new Error("Training Intelligence não está configurado.");
  const [profile,onboarding,score,cycle,assessment,photos,checkins,reviews,sessions,pain,library,knowledge]=await Promise.all([
    admin.from("profiles").select("first_name,last_name,profession,company").eq("id",clientId).single(),
    admin.from("onboarding_responses").select("responses").eq("user_id",clientId).maybeSingle(),
    admin.from("sim_scores").select("*").eq("user_id",clientId).order("created_at",{ascending:false}).limit(1).maybeSingle(),
    admin.from("cycle_strategies").select("*,cycle_priorities(*)").eq("id",cycleId).eq("client_id",clientId).single(),
    admin.from("assessments").select("*").eq("client_id",clientId).eq("status","approved").order("approved_at",{ascending:false}).limit(1).maybeSingle(),
    admin.from("assessment_photos").select("slot_id,captured_at").eq("client_id",clientId),
    admin.from("daily_checkins").select("*").eq("user_id",clientId).order("checkin_date",{ascending:false}).limit(14),
    admin.from("weekly_reviews").select("*").eq("user_id",clientId).order("week_start",{ascending:false}).limit(8),
    admin.from("workout_sessions").select("*").eq("user_id",clientId).order("started_at",{ascending:false}).limit(30),
    admin.from("pain_reports").select("*").eq("user_id",clientId).order("created_at",{ascending:false}).limit(10),
    admin.from("exercise_library").select("id,name,movement_pattern,primary_muscles,equipment,difficulty,stability_requirement,mobility_requirement,fatigue_cost,joint_considerations,red_flags,regressions,progressions,alternatives").eq("active",true),
    admin.from("training_knowledge_documents").select("title,version,content,document_type").eq("active",true).order("is_primary",{ascending:false}),
  ]);
  if(!profile.data||!cycle.data||!assessment.data) throw new Error("Dados essenciais de perfil, ciclo ou avaliação não encontrados.");
  const redFlags=(pain.data??[]).filter((item:any)=>item.classification==="RED"&&item.status!=="closed");
  if(redFlags.length) throw new Error("Geração bloqueada por sinal de saúde que exige revisão humana.");
  const { createTrainingArchitectModel }=await import("@/lib/ai-gateway.server");
  const evidence={profile:profile.data,onboarding:onboarding.data?.responses??{},sim_score:score.data,assessment:assessment.data,photo_protocol:{captured:(photos.data??[]).length},cycle:cycle.data,recent_checkins:checkins.data??[],weekly_reviews:reviews.data??[],training_history:sessions.data??[],pain_and_restrictions:pain.data??[],exercise_library:library.data??[],knowledge_base:knowledge.data??[]};
  const result=streamText({model:createTrainingArchitectModel(key),instructions:principles,prompt:`Crie o draft completo usando exclusivamente nomes da biblioteca. Contexto:\n${JSON.stringify(evidence)}`,output:Output.object({schema:trainingArchitectSchema,name:"training_draft"}),providerOptions:{openai:{forceReasoning:true,reasoningEffort:"medium",reasoningSummary:"auto",store:false,include:["reasoning.encrypted_content"]}}});
  const draft=await result.output;
  const {data:program,error}=await admin.from("workout_programs").insert({user_id:clientId,cycle_id:cycleId,title:draft.program_name,objective:draft.primary_goal,primary_goal:draft.primary_goal,why_this_plan:draft.why_this_plan,notes:draft.strategy_summary,creation_source:"AI_DRAFT",status:"draft",created_by:actorId,starts_on:cycle.data.start_date,ends_on:cycle.data.target_date}).select("id").single();
  if(error||!program) throw error??new Error("Não foi possível salvar o draft.");
  const libraryByName=new Map((library.data??[]).map((item:any)=>[item.name.trim().toLocaleLowerCase("pt-BR"),item.id]));
  for(const [sequence,workout] of draft.workouts.entries()){
    const {data:workoutRow}=await admin.from("workouts").insert({program_id:program.id,name:workout.name,objective:workout.objective,estimated_minutes:workout.estimated_minutes,variant_type:workout.variant_type,notes:workout.notes,sequence}).select("id").single();
    if(!workoutRow)continue;
    const rows=workout.exercises.flatMap((exercise,exerciseSequence)=>{const exerciseId=libraryByName.get(exercise.raw_name.trim().toLocaleLowerCase("pt-BR"));return exerciseId?[{workout_id:workoutRow.id,exercise_id:exerciseId,sequence:exerciseSequence,sets:exercise.sets,reps:exercise.reps,rep_min:exercise.rep_min,rep_max:exercise.rep_max,target_effort_type:exercise.target_effort_type,target_effort:exercise.target_effort,rest_seconds:exercise.rest_seconds,tempo:exercise.tempo,execution_notes:exercise.execution_notes,initial_load:exercise.load,pain_rule:exercise.pain_rule,video_reference:exercise.video_reference,reason_for_inclusion:exercise.reason_for_inclusion,priority_relation:exercise.priority_relation,evidence_relation:[]}]:[]});
    if(rows.length)await admin.from("workout_exercises").insert(rows);
  }
  await admin.from("training_decisions").insert({client_id:clientId,cycle_id:cycleId,program_id:program.id,decision_type:"TRAINING_ARCHITECT_DRAFT",decision:draft.decision_summary,reason:draft.strategy_summary,evidence_ids:draft.evidence_used,confidence:0.7,author_type:"AI",author_id:actorId,approval_status:"pending",ai_original:draft});
  return {programId:program.id,draft};
}
