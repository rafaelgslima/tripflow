import type { NextApiResponse } from "next";

export interface ErrorEnvelope {
  code: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized.") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden.") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found.") {
    super(404, "NOT_FOUND", message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, "VALIDATION_ERROR", message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error.") {
    super(500, "INTERNAL_ERROR", message);
  }
}

export function sendError(res: NextApiResponse, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ code: error.code, message: error.message });
    return;
  }
  console.error("Unexpected error:", error);
  res.status(500).json({ code: "INTERNAL_ERROR", message: "Internal server error." });
}

export function methodNotAllowed(res: NextApiResponse): void {
  res.status(405).json({ code: "METHOD_NOT_ALLOWED", message: "Method not allowed." });
}
