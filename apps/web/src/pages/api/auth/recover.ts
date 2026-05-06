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
    const { token, type, next, email } = req.query;

    if (!token || !type || !email) {
      res.status(400).json({ success: false, message: "Missing token, type, or email" });
      return;
    }

    const redirectUrl = next || process.env.APP_BASE_URL || "http://localhost:3000";
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // For password recovery: validate token on backend and redirect to frontend for session establishment
    if (type === "recovery") {
      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        email: email as string,
        token: token as string,
        type: "recovery",
      });

      if (error || !data?.session) {
        const errorUrl = `${redirectUrl}#error=invalid_token`;
        res.setHeader("Location", errorUrl);
        res.status(302).end();
        return;
      }

      // Token is valid - redirect to frontend with token so it can establish the session
      const resetUrl = `${redirectUrl}?token=${encodeURIComponent(token as string)}&type=recovery&email=${encodeURIComponent(email as string)}`;
      res.setHeader("Location", resetUrl);
      res.status(302).end();
      return;
    }

    // For signup: mark user as email confirmed
    if (type === "signup") {
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

    res.status(400).json({ success: false, message: "Invalid type" });
  } catch (error) {
    const next = req.query.next as string || process.env.APP_BASE_URL || "http://localhost:3000";
    const errorUrl = `${next}#error=server_error`;
    res.setHeader("Location", errorUrl);
    res.status(302).end();
  }
}
