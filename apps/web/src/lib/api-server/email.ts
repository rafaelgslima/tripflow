// TODO: Replace SendGrid with Resend once a custom domain is verified.
//   Steps to migrate:
//   1. Verify your domain at https://resend.com/domains
//   2. Remove SENDGRID_API_KEY; add RESEND_API_KEY instead
//   3. Replace the fetch call below with Resend's API (https://resend.com/docs/api-reference/emails/send-email)
//   4. Update EMAIL_FROM to noreply@yourdomain.com

const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

function buildHtml(invitedByEmail: string | null, acceptUrl: string): string {
  const inviter = invitedByEmail ?? "Someone";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden;">
        <tr>
          <td style="background:#4f46e5;padding:24px 32px;">
            <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-.5px;">TripFlow</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">You've been invited to a travel plan!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              <strong>${inviter}</strong> wants to share a travel plan with you on TripFlow.
              Click the button below to accept the invitation and start collaborating.
            </p>
            <a href="${acceptUrl}"
               style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;
                      font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">
              Accept invitation
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
              This link expires in 48 hours. If you weren't expecting this invitation, you can safely ignore this email.
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="${acceptUrl}" style="color:#4f46e5;word-break:break-all;">${acceptUrl}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function buildPlain(invitedByEmail: string | null, acceptUrl: string): string {
  const inviter = invitedByEmail ?? "Someone";
  return (
    `${inviter} wants to share a travel plan with you on TripFlow.\n\n` +
    `Accept the invitation here:\n${acceptUrl}\n\n` +
    `This link expires in 48 hours.\n` +
    `If you weren't expecting this, you can safely ignore this email.`
  );
}

export async function sendTravelPlanInvite({
  toEmail,
  invitedByEmail,
  acceptUrl,
}: {
  toEmail: string;
  invitedByEmail: string | null;
  acceptUrl: string;
}): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || !fromEmail) {
    console.info(
      `[email] SendGrid not configured (SENDGRID_API_KEY or EMAIL_FROM missing) — skipping send. to=${toEmail} accept_url=${acceptUrl}`,
    );
    return;
  }

  const inviter = invitedByEmail ?? "Someone";

  const response = await fetch(SENDGRID_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail },
      subject: `${inviter} invited you to a TripFlow travel plan`,
      content: [
        { type: "text/plain", value: buildPlain(invitedByEmail, acceptUrl) },
        { type: "text/html", value: buildHtml(invitedByEmail, acceptUrl) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[email] SendGrid error status=${response.status} body=${body}`);
    throw new Error(`Failed to send invite email (SendGrid ${response.status}).`);
  }

  console.info(`[email] Invite sent via SendGrid to=${toEmail}`);
}
