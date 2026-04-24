import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import { methodNotAllowed, sendError, ValidationError } from "@/lib/api-server/errors";

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
    const { restrict_logging } = req.body as { restrict_logging?: boolean };

    if (typeof restrict_logging !== "boolean") {
      throw new ValidationError("restrict_logging must be a boolean");
    }

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from("profile")
      .update({ restrict_logging })
      .eq("id", user.userId);

    if (error) {
      throw new ValidationError(`Failed to update preference: ${error.message}`);
    }

    res.status(200).json({ restrict_logging });
  } catch (error) {
    sendError(res, error);
  }
}
