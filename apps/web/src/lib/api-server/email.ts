import { Resend } from "resend";

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
            <span style="color:#0E0B09;font-size:22px;font-weight:700;letter-spacing:-.5px;">Planutrip</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">You've been invited to a travel plan!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              <strong>${inviter}</strong> wants to share a travel plan with you on Planutrip.
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
            <p style="margin:0 0 16px;font-size:12px;color:#9ca3af;">
              Your email was shared by <strong>${inviter}</strong> to send this invitation. It will only be used for this purpose.
              <br><a href="${process.env.APP_BASE_URL ?? "http://localhost:3000"}/privacy-policy" style="color:#E8A23A;text-decoration:underline;">View our Privacy Policy</a>
            </p>
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
    `${inviter} wants to share a travel plan with you on Planutrip.\n\n` +
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
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.info(
      `[email] Resend not configured (RESEND_API_KEY missing) — skipping send. to=${toEmail} accept_url=${acceptUrl}`,
    );
    return;
  }

  const resend = new Resend(resendApiKey);
  const inviter = invitedByEmail ?? "Someone";

  await resend.emails.send({
    from: "Planutrip <contact@planutrip.com>",
    to: toEmail,
    subject: `${inviter} invited you to a Planutrip travel plan`,
    text: buildPlain(invitedByEmail, acceptUrl),
    html: buildHtml(invitedByEmail, acceptUrl),
  });

  console.info(`[email] Invite sent via Resend to=${toEmail}`);
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
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.info(
      `[email] Resend not configured (RESEND_API_KEY missing) — skipping contact send. from=${email}`,
    );
    return;
  }

  const resend = new Resend(resendApiKey);

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
            <span style="color:#0E0B09;font-size:22px;font-weight:700;letter-spacing:-.5px;">Planutrip Contact</span>
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

  const text = `Planutrip Contact Form Submission\n\nSubject: ${subject}\nFrom: ${name} (${email})\n\nMessage:\n${message}`;

  await resend.emails.send({
    from: "Planutrip <contact@planutrip.com>",
    to: "contact@planutrip.com",
    replyTo: email,
    subject: `[Planutrip Contact] ${subject}`,
    text,
    html,
  });

  console.info(`[email] Contact message sent from=${email}`);
}

export async function sendAccountDeletedConfirmation({
  toEmail,
}: {
  toEmail: string;
}): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.info(
      `[email] Resend not configured (RESEND_API_KEY missing) — skipping account deleted email. to=${toEmail}`,
    );
    return;
  }

  const resend = new Resend(resendApiKey);

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
            <span style="color:#0E0B09;font-size:22px;font-weight:700;letter-spacing:-.5px;">Planutrip</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">Your account has been deleted</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              Your Planutrip account and all associated data have been permanently deleted as requested.
              This includes your travel plans, itineraries, and collaboration invitations.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              If you have any questions or need further assistance, please don't hesitate to contact us.
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              This is an automated confirmation email. If you did not request account deletion, please contact us immediately.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Your Planutrip account has been deleted\n\nYour account and all associated data have been permanently deleted as requested. This includes your travel plans, itineraries, and collaboration invitations.\n\nIf you have any questions, please contact us at support@planutrip.app`;

  await resend.emails.send({
    from: "Planutrip <contact@planutrip.com>",
    to: toEmail,
    subject: "Your Planutrip account has been deleted",
    text,
    html,
  });

  console.info(`[email] Account deletion confirmation sent to=${toEmail}`);
}

export function buildPasswordResetHtml(resetUrl: string): string {
  const privacyPolicyUrl = `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/privacy-policy`;
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
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 28px;background:#E8A23A;color:#0E0B09;
                      font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">
              Reset password
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
              This link expires in 48 hours. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 16px;font-size:12px;color:#9ca3af;">
              For your security, we never share passwords via email.
              <br><a href="${privacyPolicyUrl}" style="color:#E8A23A;text-decoration:underline;">View our Privacy Policy</a>
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color:#E8A23A;word-break:break-all;">${resetUrl}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function buildPasswordResetPlain(resetUrl: string): string {
  return (
    `Reset your password\n\n` +
    `Click here to reset your password:\n${resetUrl}\n\n` +
    `This link expires in 48 hours.\n` +
    `If you didn't request a password reset, you can safely ignore this email.`
  );
}

export async function sendPasswordResetEmail({
  toEmail,
  resetUrl,
}: {
  toEmail: string;
  resetUrl: string;
}): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.info(
      `[email] Resend not configured (RESEND_API_KEY missing) — skipping password reset send. to=${toEmail}`,
    );
    return;
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: "Planutrip <contact@planutrip.com>",
    to: toEmail,
    subject: "Reset your Planutrip password",
    text: buildPasswordResetPlain(resetUrl),
    html: buildPasswordResetHtml(resetUrl),
  });

  console.info(`[email] Password reset email sent via Resend to=${toEmail}`);
}

export async function sendBreachNotificationEmail({
  toEmail,
  breachDate,
  affectedData,
  remediationSteps,
}: {
  toEmail: string;
  breachDate: string;
  affectedData: string[];
  remediationSteps: string;
}): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.info("[email] Resend not configured, skipping breach notification");
    return;
  }

  const resend = new Resend(resendApiKey);
  const affectedDataList = affectedData.map((item) => `• ${item}`).join("\n");

  const text = `IMPORTANT SECURITY NOTICE

Dear Planutrip User,

We are writing to inform you that we have detected unauthorized access to our systems. As a precautionary measure and in compliance with data protection regulations, we are notifying you of this incident.

INCIDENT DETAILS:
Date of Incident: ${breachDate}

WHAT DATA MAY HAVE BEEN AFFECTED:
${affectedDataList}

WHAT WE HAVE DONE:
${remediationSteps}

WHAT YOU SHOULD DO:
1. Change your Planutrip password immediately if you haven't already
2. Monitor your email for any suspicious activity
3. Be cautious of phishing attempts
4. Contact us immediately if you notice any unauthorized activity

We take your privacy and security very seriously. We have implemented enhanced security measures to prevent future incidents.

GDPR COMPLIANCE:
As per GDPR Article 33, you are being notified within 72 hours of our discovery of this incident. If you reside in Brazil, this notification also complies with LGPD Article 33.

If you have any questions or concerns, please contact our privacy team immediately at:
privacy@planutrip.app

Thank you for your patience and trust.

The Planutrip Security Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section h3 { color: #1f2937; margin-bottom: 10px; }
    .affected-data { background-color: #fee; padding: 10px; border-left: 4px solid #dc2626; margin: 10px 0; }
    .actions { background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 10px 0; }
    .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px; }
    a { color: #0ea5e9; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">⚠️ Important Security Notice</h1>
    </div>
    <div class="content">
      <p>Dear Planutrip User,</p>
      <p>We are writing to inform you that we have detected unauthorized access to our systems. As a precautionary measure and in compliance with data protection regulations, we are notifying you of this incident.</p>

      <div class="section">
        <h3>Incident Details:</h3>
        <p><strong>Date of Incident:</strong> ${breachDate}</p>
      </div>

      <div class="section">
        <h3>What Data May Have Been Affected:</h3>
        <div class="affected-data">
          ${affectedData.map((item) => `<p style="margin: 5px 0;">• ${item}</p>`).join("")}
        </div>
      </div>

      <div class="section">
        <h3>What We Have Done:</h3>
        <div class="actions">
          ${remediationSteps.split("\n").map((step) => `<p style="margin: 5px 0;">${step}</p>`).join("")}
        </div>
      </div>

      <div class="section">
        <h3>What You Should Do:</h3>
        <ol>
          <li>Change your Planutrip password immediately if you haven't already</li>
          <li>Monitor your email for any suspicious activity</li>
          <li>Be cautious of phishing attempts</li>
          <li>Contact us immediately if you notice any unauthorized activity</li>
        </ol>
      </div>

      <div class="section" style="background-color: #e0f2fe; padding: 15px; border-left: 4px solid #0284c7; border-radius: 4px;">
        <h3 style="margin-top: 0;">GDPR & LGPD Compliance:</h3>
        <p>As per GDPR Article 33 and LGPD Article 33, you are being notified within 72 hours of our discovery of this incident.</p>
      </div>

      <p style="margin-top: 30px;">If you have any questions or concerns, please contact our privacy team immediately at:</p>
      <p style="text-align: center; font-size: 16px;"><a href="mailto:privacy@planutrip.app"><strong>privacy@planutrip.app</strong></a></p>

      <p>We take your privacy and security very seriously. Thank you for your patience and trust.</p>
      <p style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">The Planutrip Security Team</p>
    </div>
  </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: "Planutrip <contact@planutrip.com>",
    to: toEmail,
    subject: "⚠️ Important: Security Notice from Planutrip",
    text,
    html,
  });

  console.info(`[email] Breach notification sent to=${toEmail}`);
}
