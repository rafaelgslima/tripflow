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
import { validateCreateItineraryItem } from "@/lib/api-server/validation";

function extractParams(req: NextApiRequest): { travelPlanId: string; day: string } {
  const travelPlanId = req.query["id"];
  const day = req.query["day"];

  if (typeof travelPlanId !== "string" || typeof day !== "string") {
    throw new ValidationError("Invalid travel plan ID or day.");
  }

  // day must be YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new ValidationError("day must be a valid date (YYYY-MM-DD).");
  }

  return { travelPlanId, day };
}

async function assertAccess(
  userId: string,
  travelPlanId: string,
): Promise<void> {
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

async function handleGet(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const { travelPlanId, day } = extractParams(req);

  await assertAccess(user.userId, travelPlanId);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("itinerary_item")
    .select("*")
    .eq("travel_plan_id", travelPlanId)
    .eq("date", day)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new InternalError("Failed to fetch itinerary items.");

  res.status(200).json(data ?? []);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const { travelPlanId, day } = extractParams(req);
  const { description } = validateCreateItineraryItem(req.body);

  await assertAccess(user.userId, travelPlanId);

  const sortOrder = await getNextSortOrder(travelPlanId, day);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("itinerary_item")
    .insert({
      travel_plan_id: travelPlanId,
      date: day,
      description,
      created_by_user_id: user.userId,
      sort_order: sortOrder,
    })
    .select()
    .maybeSingle();

  if (error || !data) throw new InternalError("Failed to create itinerary item.");

  res.status(201).json(data);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    if (req.method === "GET") return await handleGet(req, res);
    if (req.method === "POST") return await handlePost(req, res);
    methodNotAllowed(res);
  } catch (err) {
    sendError(res, err);
  }
}
