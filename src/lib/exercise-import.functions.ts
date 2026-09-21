import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SOURCE = "Muscle & Strength";
const CATALOG_URL = "https://www.muscleandstrength.com/exercises";
const STAFF_ROLES = new Set(["coach", "manager", "admin", "admin_master", "content"]);

const pageSchema = z.object({
  name: z.string().min(1),
  primaryMuscles: z.array(z.string()).default([]),
  secondaryMuscles: z.array(z.string()).default([]),
  equipment: z.string().nullable().default(null),
  level: z.string().nullable().default(null),
  exerciseType: z.string().nullable().default(null),
  instructions: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
  videoUrl: z.string().url().nullable().default(null),
  imageUrl: z.string().url().nullable().default(null),
});

type FirecrawlResult = Record<string, unknown>;

async function verifyStaff(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  if (error || !(data ?? []).some((row: { role: string }) => STAFF_ROLES.has(row.role))) throw new Error("Acesso restrito à equipe administrativa.");
}

function firecrawlConfig() {
  const key = process.env["FIRECRAWL_API_KEY"];
  if (!key) throw new Error("Conecte o Firecrawl para descobrir e importar o catálogo.");
  if (key.startsWith("lovc_")) {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (!lovableKey) throw new Error("A conexão de coleta precisa ser reconectada.");
    return { base: "https://connector-gateway.lovable.dev/firecrawl/v2", headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": key } };
  }
  return { base: "https://api.firecrawl.dev/v2", headers: { Authorization: `Bearer ${key}` } };
}

async function firecrawl(path: string, body: Record<string, unknown>): Promise<FirecrawlResult> {
  const config = firecrawlConfig();
  const response = await fetch(`${config.base}${path}`, { method: "POST", headers: { ...config.headers, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await response.text();
  if (!response.ok) {
    console.error(`Exercise import provider failed [${response.status}]: ${text}`);
    throw new Error(`A coleta respondeu com status ${response.status}. Tente novamente mais tarde.`);
  }
  return JSON.parse(text) as FirecrawlResult;
}

function normalizeLinks(result: FirecrawlResult) {
  const nested = result["data"] && typeof result["data"] === "object" ? result["data"] as Record<string, unknown> : result;
  const values: unknown[] = Array.isArray(result["links"]) ? result["links"] : Array.isArray(nested["links"]) ? nested["links"] : [];
  return [...new Set(values.filter((value): value is string => typeof value === "string")
    .map((value) => value.split("#")[0] ?? value)
    .filter((value) => /^https:\/\/(www\.)?muscleandstrength\.com\/exercises\/[a-z0-9-]+\/?$/i.test(value))
    .map((value) => value.replace(/\/$/, "")))];
}

function slugFromUrl(url: string) { const parts = new URL(url).pathname.split("/").filter(Boolean); return parts[parts.length - 1] ?? url; }
function safeName(value: string) { return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, ""); }
function hostAllowed(url: string) {
  const host = new URL(url).hostname.toLowerCase();
  return host === "muscleandstrength.com" || host.endsWith(".muscleandstrength.com");
}

async function storeMedia(admin: any, url: string | null, folder: "video" | "image", externalId: string) {
  if (!url || !hostAllowed(url)) return null;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`Mídia indisponível (${response.status}).`);
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > 250 * 1024 * 1024) throw new Error("Mídia excede 250 MB.");
  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  if (!contentType.startsWith(folder === "video" ? "video/" : "image/")) throw new Error("Formato de mídia inválido.");
  const extension = contentType.split("/")[1]?.split(";")[0]?.replace("jpeg", "jpg") ?? "bin";
  const path = `${SOURCE.toLowerCase().replaceAll(" ", "-")}/${folder}/${safeName(externalId)}.${safeName(extension)}`;
  const payload = await response.arrayBuffer();
  const { error } = await admin.storage.from("exercise-media").upload(path, payload, { contentType, upsert: true });
  if (error) throw error;
  return path;
}

export const discoverExerciseCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyStaff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: batch, error } = await supabaseAdmin.from("exercise_import_batches").insert({ source_name: SOURCE, source_catalog_url: CATALOG_URL, requested_by: context.userId, status: "discovering", started_at: new Date().toISOString() }).select("id").single();
    if (error || !batch) throw new Error(error?.message ?? "Não foi possível iniciar a importação.");
    try {
      const mapped = await firecrawl("/map", { url: CATALOG_URL, limit: 5000, includeSubdomains: false, search: "/exercises/" });
      const links = normalizeLinks(mapped);
      if (!links.length) throw new Error("Nenhuma página de exercício foi descoberta.");
      const rows = links.map((source_url) => ({ batch_id: batch.id, source_url, source_external_id: slugFromUrl(source_url), source_name: slugFromUrl(source_url).replaceAll("-", " ") }));
      const { error: insertError } = await supabaseAdmin.from("exercise_import_items").insert(rows);
      if (insertError) throw insertError;
      await supabaseAdmin.from("exercise_import_batches").update({ status: "paused", discovered_count: rows.length, cursor_url: rows[0]?.source_url ?? null }).eq("id", batch.id);
      return { batchId: batch.id, discovered: rows.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha desconhecida";
      await supabaseAdmin.from("exercise_import_batches").update({ status: "failed", error_summary: message, completed_at: new Date().toISOString() }).eq("id", batch.id);
      throw new Error(message);
    }
  });

export const importExerciseBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ batchId: z.string().uuid(), limit: z.number().int().min(1).max(10).default(5) }).parse(input))
  .handler(async ({ data, context }) => {
    await verifyStaff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: items, error } = await supabaseAdmin.from("exercise_import_items").select("*").eq("batch_id", data.batchId).in("status", ["queued", "failed"]).order("created_at").limit(data.limit);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("exercise_import_batches").update({ status: "importing", error_summary: null }).eq("id", data.batchId);
    for (const item of items ?? []) {
      await supabaseAdmin.from("exercise_import_items").update({ status: "processing", error_message: null }).eq("id", item.id);
      try {
        const result = await firecrawl("/scrape", { url: item.source_url, onlyMainContent: true, waitFor: 2500, formats: [{ type: "json", schema: { type: "object", properties: { name: { type: "string" }, primaryMuscles: { type: "array", items: { type: "string" } }, secondaryMuscles: { type: "array", items: { type: "string" } }, equipment: { type: ["string", "null"] }, level: { type: ["string", "null"] }, exerciseType: { type: ["string", "null"] }, instructions: { type: "array", items: { type: "string" } }, tips: { type: "array", items: { type: "string" } }, videoUrl: { type: ["string", "null"] }, imageUrl: { type: ["string", "null"] } }, required: ["name"] }, prompt: "Extract the exercise profile, instructions, tips, and the direct demonstration video and image URLs. Do not invent missing values." }] });
        const nested = result["data"] && typeof result["data"] === "object" ? result["data"] as Record<string, unknown> : result;
        const parsed = pageSchema.parse(nested["json"] ?? result["json"]);
        const externalId = item.source_external_id ?? slugFromUrl(item.source_url);
        const videoPath = await storeMedia(supabaseAdmin, parsed.videoUrl, "video", externalId);
        const imagePath = await storeMedia(supabaseAdmin, parsed.imageUrl, "image", externalId);
        const { data: existing } = await supabaseAdmin.from("exercise_library").select("id").or(`and(source_name.eq.${SOURCE},source_external_id.eq.${externalId}),name.ilike.${parsed.name}`).limit(1).maybeSingle();
        const values = { name: parsed.name, muscle_group: parsed.primaryMuscles[0] ?? "Não informado", primary_muscles: parsed.primaryMuscles, secondary_muscles: parsed.secondaryMuscles, equipment: parsed.equipment, level: parsed.level, category: parsed.exerciseType, description: parsed.instructions.join("\n"), execution_cues: parsed.tips, source_name: SOURCE, source_url: item.source_url, source_external_id: externalId, source_attribution: "Muscle & Strength", source_authorized: true, source_video_url: parsed.videoUrl, source_image_url: parsed.imageUrl, video_storage_path: videoPath, image_storage_path: imagePath, video_url: videoPath ? null : parsed.videoUrl, image_url: imagePath ? null : parsed.imageUrl, import_status: videoPath || parsed.videoUrl ? "imported" : "without_video", last_synced_at: new Date().toISOString(), active: true };
        const query = existing ? supabaseAdmin.from("exercise_library").update(values).eq("id", existing.id).select("id").single() : supabaseAdmin.from("exercise_library").insert(values).select("id").single();
        const saved = await query;
        if (saved.error || !saved.data) throw new Error(saved.error?.message ?? "Falha ao salvar exercício.");
        await supabaseAdmin.from("exercise_import_items").update({ exercise_id: saved.data.id, status: videoPath || parsed.videoUrl ? (existing ? "updated" : "imported") : "without_video", video_storage_path: videoPath, image_storage_path: imagePath, raw_metadata: parsed, processed_at: new Date().toISOString() }).eq("id", item.id);
      } catch (itemError) {
        await supabaseAdmin.from("exercise_import_items").update({ status: "failed", error_message: itemError instanceof Error ? itemError.message : "Falha desconhecida", processed_at: new Date().toISOString() }).eq("id", item.id);
      }
    }
    const { data: all } = await supabaseAdmin.from("exercise_import_items").select("status").eq("batch_id", data.batchId);
    const counts = (all ?? []).reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.status]: (acc[item.status] ?? 0) + 1 }), {});
    const pending = (counts["queued"] ?? 0) + (counts["processing"] ?? 0);
    await supabaseAdmin.from("exercise_import_batches").update({ status: pending ? "paused" : counts["failed"] ? "completed_with_errors" : "completed", processed_count: (all?.length ?? 0) - pending, imported_count: counts["imported"] ?? 0, updated_count: counts["updated"] ?? 0, duplicate_count: counts["duplicate"] ?? 0, without_video_count: counts["without_video"] ?? 0, error_count: counts["failed"] ?? 0, completed_at: pending ? null : new Date().toISOString() }).eq("id", data.batchId);
    return { processed: items?.length ?? 0, remaining: pending };
  });