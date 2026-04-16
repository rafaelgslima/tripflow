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
import {
  validateUpdateItineraryItem,
  validateToggleItineraryItemDone,
} from "@/lib/api-server/validation";

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

async function fetchAndValidateItem(
  itemId: string,
  travelPlanId: string,
  day: string,
): Promise<Record<string, unknown>> {
  const supabase = getSupabaseAdminClient();
  const { data: item } = await supabase
    .from("itinerary_item")
    .select("*")
    .eq("id", itemId)
    .limit(1)
    .maybeSingle();

  if (!item) throw new NotFoundError("Itinerary item not found.");
  if (String(item["travel_plan_id"]) !== travelPlanId) {
    throw new NotFoundError("Itinerary item not found.");
  }
  if (String(item["date"]) !== day) throw new NotFoundError("Itinerary item not found.");

  return item as Record<string, unknown>;
}

async function handlePut(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const { travelPlanId, day, itemId } = extractParams(req);
  const { description, time } = validateUpdateItineraryItem(req.body);

  await assertAccess(user.userId, travelPlanId);
  await fetchAndValidateItem(itemId, travelPlanId, day);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("itinerary_item")
    .update({ description, time: time ?? null })
    .eq("id", itemId)
    .select()
    .maybeSingle();

  if (error || !data) throw new InternalError("Failed to update itinerary item.");

  res.status(200).json(data);
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const { travelPlanId, day, itemId } = extractParams(req);
  const { is_done } = validateToggleItineraryItemDone(req.body);

  await assertAccess(user.userId, travelPlanId);
  await fetchAndValidateItem(itemId, travelPlanId, day);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("itinerary_item")
    .update({ is_done })
    .eq("id", itemId)
    .select()
    .maybeSingle();

  if (error || !data) throw new InternalError("Failed to update itinerary item.");

  res.status(200).json(data);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const { travelPlanId, day, itemId } = extractParams(req);

  await assertAccess(user.userId, travelPlanId);
  await fetchAndValidateItem(itemId, travelPlanId, day);

  const supabase = getSupabaseAdminClient();
  await supabase.from("itinerary_item").delete().eq("id", itemId);

  res.status(204).end();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    if (req.method === "PUT") return await handlePut(req, res);
    if (req.method === "PATCH") return await handlePatch(req, res);
    if (req.method === "DELETE") return await handleDelete(req, res);
    methodNotAllowed(res);
  } catch (err) {
    sendError(res, err);
  }
}
