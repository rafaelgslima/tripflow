import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import { logAuditEvent } from "@/lib/api-server/audit";
import {
  sendError,
  methodNotAllowed,
  NotFoundError,
  ValidationError,
} from "@/lib/api-server/errors";

async function handleDelete(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const travelPlanId = req.query["id"];

  if (typeof travelPlanId !== "string") {
    throw new ValidationError("Invalid travel plan ID.");
  }

  const supabase = getSupabaseAdminClient();

  // Check if user is the owner
  const { data: ownedPlan } = await supabase
    .from("travel_plan")
    .select("id")
    .eq("id", travelPlanId)
    .eq("owner_user_id", user.userId)
    .limit(1)
    .maybeSingle();

  if (ownedPlan) {
    // Owner: delete the entire plan (cascades to items and shares)
    await supabase.from("travel_plan").delete().eq("id", travelPlanId);
    await logAuditEvent(user.userId, "plan.deleted", { travel_plan_id: travelPlanId });
    res.status(204).end();
    return;
  }

  // Check if user is an accepted collaborator
  const { data: share } = await supabase
    .from("travel_plan_share")
    .select("id")
    .eq("travel_plan_id", travelPlanId)
    .eq("invited_user_id", user.userId)
    .eq("status", "accepted")
    .limit(1)
    .maybeSingle();

  if (share) {
    // Collaborator: remove only their share record
    await supabase
      .from("travel_plan_share")
      .delete()
      .eq("travel_plan_id", travelPlanId)
      .eq("invited_user_id", user.userId)
      .eq("status", "accepted");
    await logAuditEvent(user.userId, "share.removed", { travel_plan_id: travelPlanId });
    res.status(204).end();
    return;
  }

  throw new NotFoundError("Travel plan not found.");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    if (req.method === "DELETE") return await handleDelete(req, res);
    methodNotAllowed(res);
  } catch (err) {
    sendError(res, err);
  }
}
