import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser, extractBearerToken } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import { logAuditEvent } from "@/lib/api-server/audit";
import {
  ValidationError,
  UnauthorizedError,
  methodNotAllowed,
  sendError,
} from "@/lib/api-server/errors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "PUT") {
    methodNotAllowed(res);
    return;
  }

  try {
    const user = await getAuthenticatedUser(req.headers.authorization);
    const { name } = req.body as { name?: string };

    if (!name || typeof name !== "string") {
      throw new ValidationError("name is required.");
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      throw new ValidationError("Name must be at least 2 characters long.");
    }
    if (trimmedName.length > 100) {
      throw new ValidationError("Name must be less than 100 characters.");
    }

    const adminSupabase = getSupabaseAdminClient();

    // Update auth metadata
    const { data: authData, error: authError } = await adminSupabase.auth.admin.updateUserById(
      user.userId,
      {
        user_metadata: { name: trimmedName },
      },
    );

    if (authError || !authData.user) {
      throw new ValidationError("Failed to update profile.");
    }

    // Update profile table - just the name field
    console.log("[update-profile] Updating profile for user:", user.userId);

    const { data: profileData, error: profileError } = await adminSupabase
      .from("profile")
      .update({ name: trimmedName })
      .eq("id", user.userId)
      .select("id, name, email");

    console.log("[update-profile] Update result:", { data: profileData, error: profileError, rowsAffected: profileData?.length });

    if (profileError) {
      console.error("[update-profile] Update failed:", profileError);
      throw new ValidationError(`Failed to update profile: ${profileError.message}`);
    }

    if (!profileData || profileData.length === 0) {
      console.warn("[update-profile] No rows updated - profile may not exist");
      throw new ValidationError("Profile not found. Please try again.");
    }

    await logAuditEvent(user.userId, "profile.updated");

    res.status(200).json({
      name: trimmedName,
    });
  } catch (error) {
    sendError(res, error);
  }
}
