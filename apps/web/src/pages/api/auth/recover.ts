import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

interface RecoverResponse {
  success: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecoverResponse>,
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ success: false });
    return;
  }

  try {
    const { token_hash, type, next, email } = req.query;

    if (!token_hash || !type || !email) {
      res.status(400).json({ success: false, message: "Missing token, type, or email" });
      return;
    }

    // Verify the token server-side using Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Map email action types to verifyOtp types
    let verifyType: "signup" | "recovery" | "invite" | "email_change" | "email" = type as any;
    if (type === "signup") {
      verifyType = "email";
    }

    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email: email as string,
      token: token_hash as string,
      type: verifyType,
    });

    if (error || !data.session) {
      const redirectUrl = next || process.env.APP_BASE_URL || "http://localhost:3000";
      const errorUrl = `${redirectUrl}#error=invalid_token&error_description=Recovery link is invalid or expired`;
      res.setHeader("Location", errorUrl);
      res.status(302).end();
      return;
    }

    // Token is valid, create session and redirect to reset-password with the session
    const redirectUrl = (next as string) || process.env.APP_BASE_URL || "http://localhost:3000";

    // Redirect to reset-password page with session info in URL
    const resetUrl = `${redirectUrl}#access_token=${encodeURIComponent(data.session.access_token)}&refresh_token=${encodeURIComponent(data.session.refresh_token)}&expires_in=${data.session.expires_in}&token_type=bearer&type=recovery`;

    res.setHeader("Location", resetUrl);
    res.status(302).end();
    return;
  } catch (error) {
    const next = req.query.next as string || process.env.APP_BASE_URL || "http://localhost:3000";
    const errorUrl = `${next}#error=server_error&error_description=An error occurred during recovery`;
    res.setHeader("Location", errorUrl);
    res.status(302).end();
  }
}
