import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import { sendError, methodNotAllowed, InternalError } from "@/lib/api-server/errors";
import { validateCreateTravelPlan } from "@/lib/api-server/validation";

async function handleGet(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const supabase = getSupabaseAdminClient();

  const { data: ownedPlans, error: ownedError } = await supabase
    .from("travel_plan")
    .select("*")
    .eq("owner_user_id", user.userId)
    .order("start_date", { ascending: true });

  if (ownedError) throw new InternalError("Failed to fetch travel plans.");

  const { data: shareRows, error: shareError } = await supabase
    .from("travel_plan_share")
    .select("travel_plan_id")
    .eq("invited_user_id", user.userId)
    .eq("status", "accepted");

  if (shareError) throw new InternalError("Failed to fetch shared plans.");

  const sharedIds = (shareRows ?? [])
    .map((r) => r.travel_plan_id as string)
    .filter(Boolean);

  let sharedPlans: Record<string, unknown>[] = [];
  if (sharedIds.length > 0) {
    const { data, error } = await supabase
      .from("travel_plan")
      .select("*")
      .in("id", sharedIds)
      .order("start_date", { ascending: true });

    if (error) throw new InternalError("Failed to fetch shared travel plans.");
    sharedPlans = (data as Record<string, unknown>[]) ?? [];
  }

  const mergedById = new Map<string, Record<string, unknown>>();
  for (const plan of [...sharedPlans, ...(ownedPlans as Record<string, unknown>[])]) {
    const id = plan["id"] as string;
    if (id) mergedById.set(id, plan);
  }

  const merged = Array.from(mergedById.values()).sort((a, b) =>
    String(a["start_date"]).localeCompare(String(b["start_date"])),
  );

  res.status(200).json(merged);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const body = validateCreateTravelPlan(req.body);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("travel_plan")
    .insert({
      owner_user_id: user.userId,
      destination_city: body.destination_city,
      start_date: body.start_date,
      end_date: body.end_date,
    })
    .select()
    .maybeSingle();

  if (error || !data) throw new InternalError("Failed to create travel plan.");

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
