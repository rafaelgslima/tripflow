import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  ValidationError,
  methodNotAllowed,
  sendError,
} from "@/lib/api-server/errors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      throw new ValidationError("email is required.");
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );

    const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const redirectTo = `${appBaseUrl.replace(/\/$/, "")}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("DEBUG [forgot-password] Full error:", JSON.stringify(error, null, 2));
      console.error("DEBUG [forgot-password] Error status:", (error as any).status);
      console.error("DEBUG [forgot-password] Error code:", (error as any).code);
      console.error("DEBUG [forgot-password] Error message:", error.message);
      throw new ValidationError(error.message || JSON.stringify(error));
    }

    res.status(200).json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
}
