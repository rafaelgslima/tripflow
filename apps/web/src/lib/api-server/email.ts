import nodemailer from "nodemailer";

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
          <td style="background:#E8A23A;padding:24px 32px;">
            <span style="color:#0E0B09;font-size:22px;font-weight:700;letter-spacing:-.5px;">TripFlow</span>
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
               style="display:inline-block;padding:12px 28px;background:#E8A23A;color:#0E0B09;
                      font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">
              Accept invitation
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
              This link expires in 48 hours. If you weren't expecting this invitation, you can safely ignore this email.
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="${acceptUrl}" style="color:#E8A23A;word-break:break-all;">${acceptUrl}</a>
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
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.info(
      `[email] Gmail not configured (GMAIL_USER or GMAIL_APP_PASSWORD missing) — skipping send. to=${toEmail} accept_url=${acceptUrl}`,
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const inviter = invitedByEmail ?? "Someone";

  await transporter.sendMail({
    from: `"TripFlow" <${gmailUser}>`,
    to: toEmail,
    subject: `${inviter} invited you to a TripFlow travel plan`,
    text: buildPlain(invitedByEmail, acceptUrl),
    html: buildHtml(invitedByEmail, acceptUrl),
  });

  console.info(`[email] Invite sent via Gmail SMTP to=${toEmail}`);
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.info(
      `[email] Gmail not configured (GMAIL_USER or GMAIL_APP_PASSWORD missing) — skipping contact send. from=${email}`,
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden;">
        <tr>
          <td style="background:#E8A23A;padding:24px 32px;">
            <span style="color:#0E0B09;font-size:22px;font-weight:700;letter-spacing:-.5px;">TripFlow Contact</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 24px;font-size:20px;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">
              ${subject}
            </h1>
            <div style="margin:0 0 24px;">
              <p style="margin:0 0 12px;font-size:15px;color:#374151;"><strong>From:</strong> ${name} (${email})</p>
              <div style="margin:16px 0;padding:16px;background:#f3f4f6;border-left:4px solid #E8A23A;border-radius:4px;">
                <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;white-space:pre-wrap;">${message}</p>
              </div>
            </div>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              This is an automated contact form submission. Reply to ${email} to contact the sender.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `TripFlow Contact Form Submission\n\nSubject: ${subject}\nFrom: ${name} (${email})\n\nMessage:\n${message}`;

  await transporter.sendMail({
    from: `"TripFlow Contact" <${gmailUser}>`,
    to: gmailUser,
    replyTo: email,
    subject: `[TripFlow Contact] ${subject}`,
    text,
    html,
  });

  console.info(`[email] Contact message sent from=${email} to=${gmailUser}`);
}
