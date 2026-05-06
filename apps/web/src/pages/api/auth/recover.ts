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
      res.status(400).json({ success: false, message: "Missing token_hash, type, or email" });
      return;
    }

    // Verify the token server-side using Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // For recovery/invite/email_change: verify token and create session
    if (type === "recovery" || type === "invite" || type === "email_change") {
      const verifyToken = token_hash as string;

      console.log("DEBUG [recover] recovery type:", { type, email, tokenLength: String(verifyToken).length });

      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        email: email as string,
        token: verifyToken,
        type: type as "recovery" | "invite" | "email_change",
      });

      console.log("DEBUG [recover] verifyOtp result:", { error: error?.message, hasSession: !!data.session });

      if (error || !data.session) {
        const redirectUrl = next || process.env.APP_BASE_URL || "http://localhost:3000";
        const errorUrl = `${redirectUrl}#error=invalid_token&error_description=Recovery link is invalid or expired`;
        res.setHeader("Location", errorUrl);
        res.status(302).end();
        return;
      }

      // Token is valid, create session and redirect
      const redirectUrl = (next as string) || process.env.APP_BASE_URL || "http://localhost:3000";
      const resetUrl = `${redirectUrl}#access_token=${encodeURIComponent(data.session.access_token)}&refresh_token=${encodeURIComponent(data.session.refresh_token)}&expires_in=${data.session.expires_in}&token_type=bearer&type=${type}`;

      res.setHeader("Location", resetUrl);
      res.status(302).end();
      return;
    }

    // For signup: mark user as email confirmed (don't verify token due to known Supabase bug)
    if (type === "signup") {
      const redirectUrl = next || process.env.APP_BASE_URL || "http://localhost:3000";

      // Get user by email
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
      const user = userData?.users?.find((u) => u.email === (email as string));

      if (!user || getUserError) {
        const errorUrl = `${redirectUrl}#error=user_not_found&error_description=User not found`;
        res.setHeader("Location", errorUrl);
        res.status(302).end();
        return;
      }

      // Mark user as email confirmed
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

      if (updateError) {
        const errorUrl = `${redirectUrl}#error=confirmation_failed&error_description=Failed to confirm email`;
        res.setHeader("Location", errorUrl);
        res.status(302).end();
        return;
      }

      // Success - redirect to login
      res.setHeader("Location", redirectUrl);
      res.status(302).end();
      return;
    }
  } catch (error) {
    const next = req.query.next as string || process.env.APP_BASE_URL || "http://localhost:3000";
    const errorUrl = `${next}#error=server_error&error_description=An error occurred during recovery`;
    res.setHeader("Location", errorUrl);
    res.status(302).end();
  }
}
