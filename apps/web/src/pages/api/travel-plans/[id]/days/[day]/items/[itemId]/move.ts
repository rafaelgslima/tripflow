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
import { validateMoveItineraryItem } from "@/lib/api-server/validation";

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

function extractParams(req: NextApiRequest): {
  travelPlanId: string;
  day: string;
  itemId: string;
} {
  const travelPlanId = req.query["id"];
  const day = req.query["day"];
  const itemId = req.query["itemId"];

  if (
    typeof travelPlanId !== "string" ||
    typeof day !== "string" ||
    typeof itemId !== "string"
  ) {
    throw new ValidationError("Invalid URL parameters.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new ValidationError("day must be a valid date (YYYY-MM-DD).");
  }

  return { travelPlanId, day, itemId };
}

async function getNextSortOrder(travelPlanId: string, day: string): Promise<number> {
  const supabase = getSupabaseAdminClient();

  const { data } = await supabase
    .from("itinerary_item")
    .select("sort_order")
    .eq("travel_plan_id", travelPlanId)
    .eq("date", day)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return 0;
  return (data["sort_order"] as number) + 1;
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const { travelPlanId, day, itemId } = extractParams(req);
  const { target_day, time } = validateMoveItineraryItem(req.body);

  if (target_day === day) {
    throw new ValidationError("target_day must be different from the current day.");
  }

  await assertAccess(user.userId, travelPlanId);

  const supabase = getSupabaseAdminClient();

  // Verify item belongs to this travel plan and source day
  const { data: item } = await supabase
    .from("itinerary_item")
    .select("id, travel_plan_id, date")
    .eq("id", itemId)
    .limit(1)
    .maybeSingle();

  if (!item) throw new NotFoundError("Itinerary item not found.");
  if (String(item["travel_plan_id"]) !== travelPlanId) {
    throw new NotFoundError("Itinerary item not found.");
  }
  if (String(item["date"]) !== day) throw new NotFoundError("Itinerary item not found.");

  // Verify target_day is within the travel plan's date range
  const { data: plan } = await supabase
    .from("travel_plan")
    .select("start_date, end_date")
    .eq("id", travelPlanId)
    .limit(1)
    .maybeSingle();

  if (!plan) throw new NotFoundError("Travel plan not found.");
  if (target_day < String(plan["start_date"]) || target_day > String(plan["end_date"])) {
    throw new ValidationError("target_day must be within the travel plan's date range.");
  }

  const sortOrder = await getNextSortOrder(travelPlanId, target_day);

  const { data: updated, error } = await supabase
    .from("itinerary_item")
    .update({ date: target_day, time: time ?? null, sort_order: sortOrder })
    .eq("id", itemId)
    .select()
    .maybeSingle();

  if (error || !updated) throw new InternalError("Failed to move itinerary item.");

  res.status(200).json(updated);
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
