from __future__ import annotations

# TODO: Replace Gmail SMTP with Resend once a verified domain is available.
#
#   Steps to migrate back to Resend:
#   1. Verify your domain at https://resend.com/domains
#   2. Set EMAIL_BACKEND=resend in your environment
#   3. Set RESEND_API_KEY=re_... in your environment
#   4. Set EMAIL_FROM=noreply@yourdomain.com in your environment
#   5. Remove GMAIL_USER / GMAIL_APP_PASSWORD from your environment
#
#   The _send_via_resend() method is kept intentionally so the switch
#   requires only changing EMAIL_BACKEND — no code rewrite needed.

import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import resend

from app.config import get_settings

logger = logging.getLogger(__name__)


def _build_html(*, invited_by_email: str | None, accept_url: str) -> str:
    inviter = invited_by_email or "Someone"
    return f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden;">
        <tr>
          <td style="background:#4f46e5;padding:24px 32px;">
            <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-.5px;">TripFlow ✈️</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">You've been invited to a travel plan!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              <strong>{inviter}</strong> wants to share a travel plan with you on TripFlow.
              Click the button below to accept the invitation and start collaborating.
            </p>
            <a href="{accept_url}"
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
              <a href="{accept_url}" style="color:#4f46e5;word-break:break-all;">{accept_url}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
""".strip()


def _build_plain(*, invited_by_email: str | None, accept_url: str) -> str:
    inviter = invited_by_email or "Someone"
    return (
        f"{inviter} wants to share a travel plan with you on TripFlow.\n\n"
        f"Accept the invitation here:\n{accept_url}\n\n"
        "This link expires in 48 hours.\n"
        "If you weren't expecting this, you can safely ignore this email."
    )


class EmailService:
    def send_travel_plan_invite(
        self,
        *,
        to_email: str,
        invited_by_email: str | None,
        accept_url: str,
    ) -> None:
        """Send a travel plan invite email.

        The active backend is controlled by the EMAIL_BACKEND setting:
          - "gmail"  → Gmail SMTP via App Password (current default)
          - "resend" → Resend API (requires a verified domain)

        Falls back to logging when required credentials are absent,
        useful for local dev without any email account configured.
        """
        settings = get_settings()
        backend = settings.email_backend.lower()

        if backend == "resend":
            self._send_via_resend(
                to_email=to_email,
                invited_by_email=invited_by_email,
                accept_url=accept_url,
                settings=settings,
            )
        else:
            self._send_via_gmail(
                to_email=to_email,
                invited_by_email=invited_by_email,
                accept_url=accept_url,
                settings=settings,
            )

    # ------------------------------------------------------------------
    # Gmail SMTP backend
    # ------------------------------------------------------------------

    def _send_via_gmail(
        self,
        *,
        to_email: str,
        invited_by_email: str | None,
        accept_url: str,
        settings,
    ) -> None:
        """Send via Gmail SMTP using an App Password.

        Requires GMAIL_USER and GMAIL_APP_PASSWORD to be set.
        How to create an App Password:
        https://support.google.com/accounts/answer/185833
        """
        if not settings.gmail_user or not settings.gmail_app_password:
            logger.info(
                "Gmail SMTP not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing) "
                "— skipping email send. to=%s accept_url=%s",
                to_email,
                accept_url,
            )
            return

        inviter = invited_by_email or "Someone"
        subject = f"{inviter} invited you to a TripFlow travel plan"

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.gmail_user
        msg["To"] = to_email
        msg.attach(MIMEText(_build_plain(invited_by_email=invited_by_email, accept_url=accept_url), "plain"))
        msg.attach(MIMEText(_build_html(invited_by_email=invited_by_email, accept_url=accept_url), "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(settings.gmail_user, settings.gmail_app_password)
            server.sendmail(settings.gmail_user, to_email, msg.as_string())

        logger.info("Gmail SMTP email sent to=%s", to_email)

    # ------------------------------------------------------------------
    # Resend backend
    # TODO: Switch EMAIL_BACKEND=resend once your domain is verified at
    #       https://resend.com/domains and EMAIL_FROM is updated to
    #       noreply@yourdomain.com.
    # ------------------------------------------------------------------

    def _send_via_resend(
        self,
        *,
        to_email: str,
        invited_by_email: str | None,
        accept_url: str,
        settings,
    ) -> None:
        """Send via Resend API.

        Requires RESEND_API_KEY and a verified sending domain in EMAIL_FROM.
        """
        if not settings.resend_api_key:
            logger.info(
                "No RESEND_API_KEY set — skipping email send. "
                "to=%s invited_by=%s accept_url=%s",
                to_email,
                invited_by_email,
                accept_url,
            )
            return

        resend.api_key = settings.resend_api_key
        inviter = invited_by_email or "Someone"

        params: resend.Emails.SendParams = {
            "from": settings.email_from,
            "to": [to_email],
            "subject": f"{inviter} invited you to a TripFlow travel plan",
            "html": _build_html(invited_by_email=invited_by_email, accept_url=accept_url),
        }

        result = resend.Emails.send(params)
        logger.info("Resend email sent id=%s to=%s", result.id, to_email)
