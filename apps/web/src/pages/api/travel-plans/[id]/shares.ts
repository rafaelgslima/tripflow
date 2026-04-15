import { createHash, randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import {
  sendError,
  methodNotAllowed,
  ForbiddenError,
  ValidationError,
  InternalError,
} from "@/lib/api-server/errors";
import { validateCreateShareInvite } from "@/lib/api-server/validation";
import { sendTravelPlanInvite } from "@/lib/api-server/email";

const INVITE_TTL_HOURS = Number(process.env.SHARE_INVITE_TTL_HOURS ?? "48");

async function handleGet(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const travelPlanId = req.query["id"];

  if (typeof travelPlanId !== "string") {
    throw new ValidationError("Invalid travel plan ID.");
  }

  const supabase = getSupabaseAdminClient();

  // Verify requester has access and fetch the plan owner
  const { data: plan } = await supabase
    .from("travel_plan")
    .select("id, owner_user_id")
    .eq("id", travelPlanId)
    .limit(1)
    .maybeSingle();

  const { data: collaboratorShare } = await supabase
    .from("travel_plan_share")
    .select("id")
    .eq("travel_plan_id", travelPlanId)
    .eq("invited_user_id", user.userId)
    .eq("status", "accepted")
    .limit(1)
    .maybeSingle();

  const isOwner = plan?.owner_user_id === user.userId;
  if (!isOwner && !collaboratorShare) {
    throw new ForbiddenError("You do not have access to this travel plan.");
  }

  const { data: shares, error: sharesError } = await supabase
    .from("travel_plan_share")
    .select("id, invited_email, status, invited_user_id")
    .eq("travel_plan_id", travelPlanId)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: true });

  if (sharesError) throw new InternalError("Failed to fetch shares.");

  // Collect all user IDs whose names we need: accepted collaborators + the owner
  const ownerUserId = plan?.owner_user_id as string;
  const acceptedUserIds = (shares ?? [])
    .filter((s) => s.status === "accepted" && s.invited_user_id)
    .map((s) => s.invited_user_id as string);
  const allUserIds = [...new Set([ownerUserId, ...acceptedUserIds])];

  const namesByUserId: Record<string, string> = {};
  const emailsByUserId: Record<string, string> = {};
  await Promise.all(
    allUserIds.map(async (userId) => {
      const { data } = await supabase.auth.admin.getUserById(userId);
      const authUser = data?.user;
      if (authUser) {
        const name = authUser.user_metadata?.name as string | undefined;
        if (name) namesByUserId[userId] = name;
        if (authUser.email) emailsByUserId[userId] = authUser.email;
      }
    }),
  );

  // Build the owner entry so collaborators can see who created the plan
  const ownerEntry = {
    id: `owner-${ownerUserId}`,
    invited_email: emailsByUserId[ownerUserId] ?? "",
    status: "accepted" as const,
    invited_name: namesByUserId[ownerUserId] ?? null,
  };

  const collaboratorEntries = (shares ?? []).map((s) => ({
    id: s.id as string,
    invited_email: s.invited_email as string,
    status: s.status as "pending" | "accepted",
    invited_name: s.invited_user_id ? (namesByUserId[s.invited_user_id as string] ?? null) : null,
  }));

  // Owner entry first, then collaborators
  res.status(200).json([ownerEntry, ...collaboratorEntries]);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const user = await getAuthenticatedUser(req.headers.authorization);
  const travelPlanId = req.query["id"];

  if (typeof travelPlanId !== "string") {
    throw new ValidationError("Invalid travel plan ID.");
  }

  const { invited_email } = validateCreateShareInvite(req.body);
  const supabase = getSupabaseAdminClient();

  // Verify requester has access to the travel plan
  const { data: ownedPlan } = await supabase
    .from("travel_plan")
    .select("id")
    .eq("id", travelPlanId)
    .eq("owner_user_id", user.userId)
    .limit(1)
    .maybeSingle();

  const { data: collaboratorShare } = await supabase
    .from("travel_plan_share")
    .select("id")
    .eq("travel_plan_id", travelPlanId)
    .eq("invited_user_id", user.userId)
    .eq("status", "accepted")
    .limit(1)
    .maybeSingle();

  if (!ownedPlan && !collaboratorShare) {
    throw new ForbiddenError("You do not have access to this travel plan.");
  }

  if (user.email && user.email.toLowerCase() === invited_email.toLowerCase()) {
    throw new ValidationError("You cannot invite your own email address.");
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const { data: share, error: upsertError } = await supabase
    .from("travel_plan_share")
    .upsert(
      {
        travel_plan_id: travelPlanId,
        invited_email,
        invited_user_id: null,
        invited_by_user_id: user.userId,
        status: "pending",
        invite_token_hash: tokenHash,
        invite_token_expires_at: expiresAt,
        invite_token_used_at: null,
        accepted_at: null,
      },
      { onConflict: "travel_plan_id,invited_email" },
    )
    .select()
    .maybeSingle();

  if (upsertError || !share) throw new InternalError("Failed to create share invite.");

  const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const acceptUrl = `${appBaseUrl.replace(/\/$/, "")}/share/accept?token=${token}`;

  try {
    await sendTravelPlanInvite({
      toEmail: invited_email,
      invitedByEmail: user.email,
      acceptUrl,
    });
  } catch (emailErr) {
    console.error("[shares] Failed to send invite email:", emailErr);
    throw new InternalError(
      "Invite created but failed to send the invitation email. Please try again.",
    );
  }

  res.status(201).json({
    travel_plan_id: travelPlanId,
    invited_email,
    status: String(share["status"] ?? "pending"),
  });
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
