import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

interface SendEmailRequest {
  token?: string;
  type: string;
  email: {
    to: string;
    subject?: string;
    html?: string;
    text?: string;
    otp?: string;
    confirmation_url?: string;
    email_change_token_new?: string;
    email_change_email_new?: string;
    new_email_change_token?: string;
    [key: string]: any;
  };
}

interface SendEmailResponse {
  success: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendEmailResponse>,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ success: false });
    return;
  }

  try {
    const { type, email } = req.body as SendEmailRequest;
    const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

    console.log("DEBUG [send-email-hook] type:", type);
    console.log("DEBUG [send-email-hook] to:", email.to);

    // Get email content from Supabase (could be html or confirmation_url)
    let html = email.html || "";
    let subject = email.subject || getEmailSubject(type);

    // If no HTML, construct from confirmation_url
    if (!html && email.confirmation_url) {
      html = getEmailHtml(type, email.confirmation_url);
    }

    // Modify redirect URL in HTML based on email type
    if (html) {
      if (type === "recovery") {
        // Password reset - redirect to /reset-password
        const resetUrl = `${appBaseUrl.replace(/\/$/, "")}/reset-password`;
        html = html.replace(
          /redirect_to=[^&"']*/g,
          `redirect_to=${encodeURIComponent(resetUrl)}`,
        );
        console.log("DEBUG [send-email-hook] modified recovery redirect to:", resetUrl);
      } else if (type === "signup" || type === "invite") {
        // Signup/invite - redirect to /login
        const loginUrl = `${appBaseUrl.replace(/\/$/, "")}/login`;
        html = html.replace(
          /redirect_to=[^&"']*/g,
          `redirect_to=${encodeURIComponent(loginUrl)}`,
        );
        console.log("DEBUG [send-email-hook] modified signup redirect to:", loginUrl);
      }
    }

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      res.status(500).json({ success: false });
      return;
    }

    const resend = new Resend(resendApiKey);

    console.log("DEBUG [send-email-hook] sending email via Resend");
    await resend.emails.send({
      from: "Planutrip <contact@planutrip.com>",
      to: email.to,
      subject,
      html,
    });

    console.log("DEBUG [send-email-hook] email sent successfully");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("DEBUG [send-email-hook] error:", error);
    res.status(500).json({ success: false });
  }
}

function getEmailSubject(type: string): string {
  switch (type) {
    case "recovery":
      return "Reset Your Password";
    case "signup":
    case "invite":
      return "Confirm Your Email";
    case "email_change":
      return "Confirm Your New Email";
    default:
      return "Action Required";
  }
}

function getEmailHtml(
  type: string,
  confirmationUrl: string,
): string {
  const privacyPolicyUrl = `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/privacy-policy`;

  if (type === "recovery") {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden;">
        <tr>
          <td style="background:#E8A23A;padding:24px 32px;">
            <span style="color:#0E0B09;font-size:22px;font-weight:700;letter-spacing:-.5px;">Planutrip</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">Reset your password</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              We received a request to reset your Planutrip password.
              Click the button below to create a new password.
            </p>
            <a href="${confirmationUrl}"
               style="display:inline-block;padding:12px 28px;background:#E8A23A;color:#0E0B09;
                      font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">
              Reset password
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
              This link expires in 24 hours. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 16px;font-size:12px;color:#9ca3af;">
              For your security, we never share passwords via email.
              <br><a href="${privacyPolicyUrl}" style="color:#E8A23A;text-decoration:underline;">View our Privacy Policy</a>
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="${confirmationUrl}" style="color:#E8A23A;word-break:break-all;">${confirmationUrl}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  // Default signup/invite confirmation email
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden;">
        <tr>
          <td style="background:#E8A23A;padding:24px 32px;">
            <span style="color:#0E0B09;font-size:22px;font-weight:700;letter-spacing:-.5px;">Planutrip</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">Confirm your email</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              Click the button below to confirm your email address.
            </p>
            <a href="${confirmationUrl}"
               style="display:inline-block;padding:12px 28px;background:#E8A23A;color:#0E0B09;
                      font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">
              Confirm email
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
              This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="${confirmationUrl}" style="color:#E8A23A;word-break:break-all;">${confirmationUrl}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
