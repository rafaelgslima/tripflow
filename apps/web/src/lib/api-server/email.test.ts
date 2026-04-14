// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendTravelPlanInvite } from "./email";

const ACCEPT_URL = "http://localhost:3000/share/accept?token=abc123";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  process.env.SENDGRID_API_KEY = "SG.test-key";
  process.env.EMAIL_FROM = "sender@example.com";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.SENDGRID_API_KEY;
  delete process.env.EMAIL_FROM;
});

describe("sendTravelPlanInvite", () => {
  it("sends a POST request to SendGrid with the correct payload", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 202 }));

    await sendTravelPlanInvite({
      toEmail: "friend@example.com",
      invitedByEmail: "owner@example.com",
      acceptUrl: ACCEPT_URL,
    });

    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];

    expect(url).toBe("https://api.sendgrid.com/v3/mail/send");
    expect(options.method).toBe("POST");
    expect((options.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer SG.test-key",
    );

    const body = JSON.parse(options.body as string);
    expect(body.personalizations[0].to[0].email).toBe("friend@example.com");
    expect(body.from.email).toBe("sender@example.com");
    expect(body.subject).toContain("owner@example.com");
    expect(body.content).toHaveLength(2);
  });

  it("uses 'Someone' as the sender name when invitedByEmail is null", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 202 }));

    await sendTravelPlanInvite({
      toEmail: "friend@example.com",
      invitedByEmail: null,
      acceptUrl: ACCEPT_URL,
    });

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.subject).toContain("Someone");
  });

  it("skips sending and logs when SENDGRID_API_KEY is not set", async () => {
    delete process.env.SENDGRID_API_KEY;
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendTravelPlanInvite({
      toEmail: "friend@example.com",
      invitedByEmail: null,
      acceptUrl: ACCEPT_URL,
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("not configured"));
    infoSpy.mockRestore();
  });

  it("skips sending when EMAIL_FROM is not set", async () => {
    delete process.env.EMAIL_FROM;

    await sendTravelPlanInvite({
      toEmail: "friend@example.com",
      invitedByEmail: null,
      acceptUrl: ACCEPT_URL,
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws when SendGrid returns a non-OK status", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("Unauthorized", { status: 401 }),
    );

    await expect(
      sendTravelPlanInvite({
        toEmail: "friend@example.com",
        invitedByEmail: null,
        acceptUrl: ACCEPT_URL,
      }),
    ).rejects.toThrow("SendGrid 401");
  });
});
