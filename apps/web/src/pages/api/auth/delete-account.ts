import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import {
  ValidationError,
  methodNotAllowed,
  sendError,
} from "@/lib/api-server/errors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "DELETE") {
    methodNotAllowed(res);
    return;
  }

  try {
    const user = await getAuthenticatedUser(req.headers.authorization);
    const supabase = getSupabaseAdminClient();

    console.log("[delete-account] Starting account deletion for user:", user.userId);

    // Delete user from auth (this cascades to delete profile due to ON DELETE CASCADE)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
      user.userId
    );

    if (deleteAuthError) {
      console.error("[delete-account] Auth deletion error:", deleteAuthError);
      throw new ValidationError("Failed to delete account.");
    }

    console.log("[delete-account] Account successfully deleted for user:", user.userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    sendError(res, error);
  }
}
