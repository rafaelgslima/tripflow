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
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password || !name) {
      throw new ValidationError("email, password and name are required.");
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );

    const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const emailRedirectTo = `${appBaseUrl.replace(/\/$/, "")}/login`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { name },
      },
    });

    if (error) {
      throw new ValidationError(error.message);
    }

    if (!data.user) {
      throw new Error("Failed to create account.");
    }

    res.status(201).json({ userId: data.user.id });
  } catch (error) {
    sendError(res, error);
  }
}
