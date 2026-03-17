from unittest.mock import MagicMock, call, patch

import pytest

from app.services.email import EmailService


@pytest.fixture
def service() -> EmailService:
    return EmailService()


# ---------------------------------------------------------------------------
# Gmail SMTP backend (EMAIL_BACKEND=gmail, current default)
# ---------------------------------------------------------------------------


def test_gmail_sends_email_via_smtp(service: EmailService):
    """Gmail backend calls smtplib.SMTP_SSL and logs success."""
    with patch("app.services.email.get_settings") as mock_settings, \
         patch("app.services.email.smtplib.SMTP_SSL") as mock_smtp_cls:

        mock_settings.return_value = MagicMock(
            email_backend="gmail",
            gmail_user="sender@gmail.com",
            gmail_app_password="app-password-16",
        )
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__ = MagicMock(return_value=mock_server)
        mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)

        service.send_travel_plan_invite(
            to_email="friend@example.com",
            invited_by_email="owner@example.com",
            accept_url="http://localhost:3000/share/accept?token=abc",
        )

    mock_smtp_cls.assert_called_once_with("smtp.gmail.com", 465, context=mock_smtp_cls.call_args[1]["context"])
    mock_server.login.assert_called_once_with("sender@gmail.com", "app-password-16")
    mock_server.sendmail.assert_called_once()
    _, send_to, raw_msg = mock_server.sendmail.call_args[0]
    assert send_to == "friend@example.com"
    assert "owner@example.com" in raw_msg


def test_gmail_skips_send_when_credentials_missing(service: EmailService, caplog):
    """Gmail backend logs and skips when GMAIL_USER or GMAIL_APP_PASSWORD is absent."""
    with patch("app.services.email.get_settings") as mock_settings, \
         patch("app.services.email.smtplib.SMTP_SSL") as mock_smtp_cls:

        mock_settings.return_value = MagicMock(
            email_backend="gmail",
            gmail_user=None,
            gmail_app_password=None,
        )

        with caplog.at_level("INFO", logger="app.services.email"):
            service.send_travel_plan_invite(
                to_email="friend@example.com",
                invited_by_email="owner@example.com",
                accept_url="http://localhost:3000/share/accept?token=abc",
            )

    mock_smtp_cls.assert_not_called()
    assert "Gmail SMTP not configured" in caplog.text
    assert "friend@example.com" in caplog.text


def test_gmail_email_contains_inviter_and_accept_url(service: EmailService):
    """The raw email sent via Gmail includes the inviter name and accept URL."""
    with patch("app.services.email.get_settings") as mock_settings, \
         patch("app.services.email.smtplib.SMTP_SSL") as mock_smtp_cls:

        mock_settings.return_value = MagicMock(
            email_backend="gmail",
            gmail_user="sender@gmail.com",
            gmail_app_password="app-password-16",
        )
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__ = MagicMock(return_value=mock_server)
        mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)

        service.send_travel_plan_invite(
            to_email="friend@example.com",
            invited_by_email="alice@example.com",
            accept_url="http://localhost:3000/share/accept?token=xyz",
        )

    _, _, raw_msg = mock_server.sendmail.call_args[0]
    assert "alice@example.com" in raw_msg
    assert "http://localhost:3000/share/accept?token=xyz" in raw_msg


def test_gmail_uses_someone_when_inviter_is_none(service: EmailService):
    """When invited_by_email is None, Gmail email uses 'Someone' as the inviter."""
    with patch("app.services.email.get_settings") as mock_settings, \
         patch("app.services.email.smtplib.SMTP_SSL") as mock_smtp_cls:

        mock_settings.return_value = MagicMock(
            email_backend="gmail",
            gmail_user="sender@gmail.com",
            gmail_app_password="app-password-16",
        )
        mock_server = MagicMock()
        mock_smtp_cls.return_value.__enter__ = MagicMock(return_value=mock_server)
        mock_smtp_cls.return_value.__exit__ = MagicMock(return_value=False)

        service.send_travel_plan_invite(
            to_email="friend@example.com",
            invited_by_email=None,
            accept_url="http://localhost:3000/share/accept?token=xyz",
        )

    _, _, raw_msg = mock_server.sendmail.call_args[0]
    assert "Someone" in raw_msg


# ---------------------------------------------------------------------------
# Resend backend (EMAIL_BACKEND=resend)
# ---------------------------------------------------------------------------


def test_resend_sends_email_when_api_key_set(service: EmailService):
    """Resend backend calls resend.Emails.send when RESEND_API_KEY is configured."""
    with patch("app.services.email.get_settings") as mock_settings, \
         patch("app.services.email.resend") as mock_resend:

        mock_settings.return_value = MagicMock(
            email_backend="resend",
            resend_api_key="re_test_key",
            email_from="onboarding@resend.dev",
        )
        mock_send_response = MagicMock()
        mock_send_response.id = "email-id-123"
        mock_resend.Emails.send.return_value = mock_send_response

        service.send_travel_plan_invite(
            to_email="friend@example.com",
            invited_by_email="owner@example.com",
            accept_url="http://localhost:3000/share/accept?token=abc",
        )

    mock_resend.Emails.send.assert_called_once()
    call_params = mock_resend.Emails.send.call_args[0][0]
    assert call_params["to"] == ["friend@example.com"]
    assert "owner@example.com" in call_params["subject"]
    assert "http://localhost:3000/share/accept?token=abc" in call_params["html"]


def test_resend_skips_send_when_no_api_key(service: EmailService, caplog):
    """Resend backend logs and skips when RESEND_API_KEY is not set."""
    with patch("app.services.email.get_settings") as mock_settings, \
         patch("app.services.email.resend") as mock_resend:

        mock_settings.return_value = MagicMock(
            email_backend="resend",
            resend_api_key=None,
            email_from="onboarding@resend.dev",
        )

        with caplog.at_level("INFO", logger="app.services.email"):
            service.send_travel_plan_invite(
                to_email="friend@example.com",
                invited_by_email="owner@example.com",
                accept_url="http://localhost:3000/share/accept?token=abc",
            )

    mock_resend.Emails.send.assert_not_called()
    assert "No RESEND_API_KEY set" in caplog.text
    assert "friend@example.com" in caplog.text
