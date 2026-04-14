import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import {
  sendError,
  methodNotAllowed,
  NotFoundError,
  ValidationError,
  InternalError,
} from "@/lib/api-server/errors";
import { validateReorderItineraryItems } from "@/lib/api-server/validation";

async function assertAccess(userId: string, travelPlanId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { data: owned } = await supabase
    .from("travel_plan")
    .select("id")
    .eq("id", travelPlanId)
    .eq("owner_user_id", userId)
    .limit(1)
    .maybeSingle();

  if (owned) return;

  const { data: shared } = await supabase
    .from("travel_plan_share")
    .select("id")
    .eq("travel_plan_id", travelPlanId)
    .eq("invited_user_id", userId)
    .eq("status", "accepted")
    .limit(1)
    .maybeSingle();

  if (shared) return;

  throw new NotFoundError("Travel plan not found.");
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const travelPlanId = req.query["id"];
  const day = req.query["day"];

  if (typeof travelPlanId !== "string" || typeof day !== "string") {
    throw new ValidationError("Invalid travel plan ID or day.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new ValidationError("day must be a valid date (YYYY-MM-DD).");
  }

  const { item_ids_in_order } = validateReorderItineraryItems(req.body);

  await assertAccess(user.userId, travelPlanId);

  const supabase = getSupabaseAdminClient();

  // Verify the submitted IDs exactly match the existing items for this day
  const { data: existing, error: fetchError } = await supabase
    .from("itinerary_item")
    .select("id")
    .eq("travel_plan_id", travelPlanId)
    .eq("date", day);

  if (fetchError) throw new InternalError("Failed to fetch itinerary items.");

  const existingIds = new Set((existing ?? []).map((r) => r["id"] as string));
  const desiredIds = new Set(item_ids_in_order);

  if (
    existingIds.size !== desiredIds.size ||
    ![...existingIds].every((id) => desiredIds.has(id))
  ) {
    throw new ValidationError(
      "item_ids_in_order must include exactly all itinerary items for this day.",
    );
  }

  // Two-pass update to avoid UNIQUE(travel_plan_id, date, sort_order) constraint violations
  // Pass 1: set all to negative temporary values
  for (let i = 0; i < item_ids_in_order.length; i++) {
    const { error } = await supabase
      .from("itinerary_item")
      .update({ sort_order: -(i + 1) })
      .eq("id", item_ids_in_order[i]);
    if (error) throw new InternalError("Failed to reorder itinerary items.");
  }

  // Pass 2: set to final positive values
  for (let i = 0; i < item_ids_in_order.length; i++) {
    const { error } = await supabase
      .from("itinerary_item")
      .update({ sort_order: i })
      .eq("id", item_ids_in_order[i]);
    if (error) throw new InternalError("Failed to reorder itinerary items.");
  }

  res.status(204).end();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    if (req.method === "PATCH") return await handlePatch(req, res);
    methodNotAllowed(res);
  } catch (err) {
    sendError(res, err);
  }
}
