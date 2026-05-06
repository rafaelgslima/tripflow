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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // For recovery: verify token and create session
    if (type === "recovery") {
      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        email: email as string,
        token: token_hash as string,
        type: "recovery",
      });

      if (error || !data.session) {
        const redirectUrl = next || process.env.APP_BASE_URL || "http://localhost:3000";
        const errorUrl = `${redirectUrl}#error=invalid_token&error_description=Recovery link is invalid or expired`;
        res.setHeader("Location", errorUrl);
        res.status(302).end();
        return;
      }

      const redirectUrl = (next as string) || process.env.APP_BASE_URL || "http://localhost:3000";
      const resetUrl = `${redirectUrl}#access_token=${encodeURIComponent(data.session.access_token)}&refresh_token=${encodeURIComponent(data.session.refresh_token)}&expires_in=${data.session.expires_in}&token_type=bearer&type=recovery`;

      res.setHeader("Location", resetUrl);
      res.status(302).end();
      return;
    }

    // For signup: mark user as email confirmed
    if (type === "signup") {
      const redirectUrl = next || process.env.APP_BASE_URL || "http://localhost:3000";

      const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
      const user = userData?.users?.find((u) => u.email === (email as string));

      if (!user) {
        const errorUrl = `${redirectUrl}#error=user_not_found`;
        res.setHeader("Location", errorUrl);
        res.status(302).end();
        return;
      }

      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

      res.setHeader("Location", redirectUrl);
      res.status(302).end();
      return;
    }
  } catch (error) {
    const next = req.query.next as string || process.env.APP_BASE_URL || "http://localhost:3000";
    const errorUrl = `${next}#error=server_error`;
    res.setHeader("Location", errorUrl);
    res.status(302).end();
  }
}
