// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import type { NextApiResponse } from "next";
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  InternalError,
  sendError,
  methodNotAllowed,
} from "./errors";

function mockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as NextApiResponse, status, json };
}

describe("Error classes", () => {
  it.each([
    [new UnauthorizedError("msg"), 401, "UNAUTHORIZED"],
    [new ForbiddenError("msg"), 403, "FORBIDDEN"],
    [new NotFoundError("msg"), 404, "NOT_FOUND"],
    [new ValidationError("msg"), 422, "VALIDATION_ERROR"],
    [new ConflictError("msg"), 409, "CONFLICT"],
    [new InternalError("msg"), 500, "INTERNAL_ERROR"],
  ])("%s has correct status and code", (err, statusCode, code) => {
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(statusCode);
    expect(err.code).toBe(code);
    expect(err.message).toBe("msg");
  });

  it("uses default messages when none provided", () => {
    expect(new UnauthorizedError().message).toBe("Unauthorized.");
    expect(new NotFoundError().message).toBe("Not found.");
    expect(new InternalError().message).toBe("Internal server error.");
  });
});

describe("sendError", () => {
  it("sends correct status and body for AppError", () => {
    const { res, status, json } = mockRes();
    sendError(res, new NotFoundError("Thing not found."));
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ code: "NOT_FOUND", message: "Thing not found." });
  });

  it("sends 500 for unexpected errors", () => {
    const { res, status, json } = mockRes();
    sendError(res, new Error("boom"));
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      code: "INTERNAL_ERROR",
      message: "Internal server error.",
    });
  });
});

describe("methodNotAllowed", () => {
  it("sends 405 with correct body", () => {
    const { res, status, json } = mockRes();
    methodNotAllowed(res);
    expect(status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({
      code: "METHOD_NOT_ALLOWED",
      message: "Method not allowed.",
    });
  });
});
