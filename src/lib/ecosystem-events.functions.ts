import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const eventSchema = z.object({
  eventType: z.enum(["content.viewed", "select.partner.opened", "select.benefit.opened", "experience.interest.created"]),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export const recordEcosystemEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => eventSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("crm_events").insert({ user_id: context.userId, event_type: data.eventType, metadata: data.metadata });
    if (error) throw new Error(error.message);
    return { ok: true };
  });