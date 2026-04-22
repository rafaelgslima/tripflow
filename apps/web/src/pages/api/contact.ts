import type { NextApiRequest, NextApiResponse } from "next";
import {
  ValidationError,
  methodNotAllowed,
  sendError,
} from "@/lib/api-server/errors";
import { sendContactEmail } from "@/lib/api-server/email";

interface RequestBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  try {
    const { name, email, subject, message } = req.body as RequestBody;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new ValidationError("Name is required.");
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      throw new ValidationError("Email is required.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError("Please enter a valid email address.");
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      throw new ValidationError("Subject is required.");
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      throw new ValidationError("Message is required.");
    }

    if (message.trim().length < 10) {
      throw new ValidationError("Message must be at least 10 characters.");
    }

    await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
}
