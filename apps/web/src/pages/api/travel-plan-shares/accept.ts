import { createHash } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import { logAuditEvent } from "@/lib/api-server/audit";
import {
  sendError,
  methodNotAllowed,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  ValidationError,
  InternalError,
} from "@/lib/api-server/errors";
import { validateAcceptShareInvite } from "@/lib/api-server/validation";

async function handlePost(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);

  if (!user.email) {
    throw new ValidationError("Your account is missing an email address.");
  }

  const { token } = validateAcceptShareInvite(req.body);
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const supabase = getSupabaseAdminClient();

  const { data: share } = await supabase
    .from("travel_plan_share")
    .select("*")
    .eq("invite_token_hash", tokenHash)
    .limit(1)
    .maybeSingle();

  if (!share) throw new NotFoundError("Invite link is invalid.");

  if (share["invite_token_used_at"]) {
    throw new ConflictError("Invite link has already been used.");
  }

  const expiresAt = share["invite_token_expires_at"];
  if (expiresAt && new Date(expiresAt as string) < new Date()) {
    throw new ValidationError("Invite link has expired.");
  }

  const invitedEmail = String(share["invited_email"] ?? "")
    .trim()
    .toLowerCase();
  if (invitedEmail && user.email.trim().toLowerCase() !== invitedEmail) {
    throw new ForbiddenError(
      `This invite was sent to ${share["invited_email"]}. Please sign in with that email address to accept it.`,
    );
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("travel_plan_share")
    .update({
      status: "accepted",
      invited_user_id: user.userId,
      accepted_at: now,
      invite_token_used_at: now,
    })
    .eq("id", share["id"])
    .select()
    .maybeSingle();

  if (updateError || !updated) throw new InternalError("Failed to accept share invite.");

  await logAuditEvent(user.userId, "share.accepted", {
    travel_plan_id: String(updated["travel_plan_id"]),
  });

  res.status(200).json({
    travel_plan_id: String(updated["travel_plan_id"]),
    status: String(updated["status"] ?? "accepted"),
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    if (req.method === "POST") return await handlePost(req, res);
    methodNotAllowed(res);
  } catch (err) {
    sendError(res, err);
  }
}
