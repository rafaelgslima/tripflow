// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendTravelPlanInvite } from "./email";

const ACCEPT_URL = "http://localhost:3000/share/accept?token=abc123";

const mockSendMail = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

beforeEach(() => {
  mockSendMail.mockResolvedValue({ messageId: "test-id" });
  process.env.GMAIL_USER = "app@example.com";
  process.env.GMAIL_APP_PASSWORD = "test-password";
});

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
});

describe("sendTravelPlanInvite", () => {
  it("sends a POST request to SendGrid with the correct payload", async () => {
    await sendTravelPlanInvite({
      toEmail: "friend@example.com",
      invitedByEmail: "owner@example.com",
      acceptUrl: ACCEPT_URL,
    });

    expect(mockSendMail).toHaveBeenCalledOnce();
    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.to).toBe("friend@example.com");
    expect(callArgs.subject).toContain("owner@example.com");
    expect(callArgs.text).toBeDefined();
    expect(callArgs.html).toBeDefined();
  });

  it("uses 'Someone' as the sender name when invitedByEmail is null", async () => {
    await sendTravelPlanInvite({
      toEmail: "friend@example.com",
      invitedByEmail: null,
      acceptUrl: ACCEPT_URL,
    });

    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.subject).toContain("Someone");
  });

  it("skips sending and logs when SENDGRID_API_KEY is not set", async () => {
    delete process.env.GMAIL_USER;
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendTravelPlanInvite({
      toEmail: "friend@example.com",
      invitedByEmail: null,
      acceptUrl: ACCEPT_URL,
    });

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("not configured"));
    infoSpy.mockRestore();
  });

  it("skips sending when EMAIL_FROM is not set", async () => {
    delete process.env.GMAIL_APP_PASSWORD;

    await sendTravelPlanInvite({
      toEmail: "friend@example.com",
      invitedByEmail: null,
      acceptUrl: ACCEPT_URL,
    });

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("throws when SendGrid returns a non-OK status", async () => {
    mockSendMail.mockRejectedValue(new Error("SendGrid 401"));

    await expect(
      sendTravelPlanInvite({
        toEmail: "friend@example.com",
        invitedByEmail: null,
        acceptUrl: ACCEPT_URL,
      }),
    ).rejects.toThrow("SendGrid 401");
  });
});
