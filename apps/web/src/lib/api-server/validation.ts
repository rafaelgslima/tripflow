import { ValidationError } from "./errors";

export interface CreateTravelPlanBody {
  destination_city: string;
  start_date: string;
  end_date: string;
}

export interface CreateItineraryItemBody {
  description: string;
  time: string | null;
}

export interface UpdateItineraryItemBody {
  description: string;
  time: string | null;
}

export interface ReorderItineraryItemsBody {
  item_ids_in_order: string[];
}

export interface CreateShareInviteBody {
  invited_email: string;
}

export interface AcceptShareInviteBody {
  token: string;
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireString(
  body: Record<string, unknown>,
  field: string,
  maxLength: number,
): string {
  const value = body[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${field} is required.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${field} must be at most ${maxLength} characters.`);
  }
  return trimmed;
}

export function validateCreateTravelPlan(body: unknown): CreateTravelPlanBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;

  const destination_city = requireString(b, "destination_city", 255);

  const start_date = b["start_date"];
  if (typeof start_date !== "string" || !DATE_REGEX.test(start_date)) {
    throw new ValidationError("start_date must be a valid date (YYYY-MM-DD).");
  }

  const end_date = b["end_date"];
  if (typeof end_date !== "string" || !DATE_REGEX.test(end_date)) {
    throw new ValidationError("end_date must be a valid date (YYYY-MM-DD).");
  }

  if (end_date < start_date) {
    throw new ValidationError("end_date must be on or after start_date.");
  }

  return { destination_city, start_date, end_date };
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseOptionalTime(body: Record<string, unknown>): string | null {
  const value = body["time"];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !TIME_REGEX.test(value)) {
    throw new ValidationError("time must be in HH:MM format (e.g. '09:30').");
  }
  return value;
}

export function validateCreateItineraryItem(body: unknown): CreateItineraryItemBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;
  const description = requireString(b, "description", 2000);
  const time = parseOptionalTime(b);
  return { description, time };
}

export function validateUpdateItineraryItem(body: unknown): UpdateItineraryItemBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;
  const description = requireString(b, "description", 2000);
  const time = parseOptionalTime(b);
  return { description, time };
}

export function validateReorderItineraryItems(body: unknown): ReorderItineraryItemsBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;
  const ids = b["item_ids_in_order"];

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError("item_ids_in_order must be a non-empty array.");
  }
  if (ids.length > 500) {
    throw new ValidationError("item_ids_in_order must contain at most 500 items.");
  }
  for (const id of ids) {
    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      throw new ValidationError("item_ids_in_order must contain valid UUIDs.");
    }
  }
  if (new Set(ids).size !== ids.length) {
    throw new ValidationError("item_ids_in_order must contain unique IDs.");
  }

  return { item_ids_in_order: ids };
}

export function validateCreateShareInvite(body: unknown): CreateShareInviteBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;
  const invited_email = b["invited_email"];

  if (typeof invited_email !== "string" || !EMAIL_REGEX.test(invited_email.trim())) {
    throw new ValidationError("invited_email must be a valid email address.");
  }

  return { invited_email: invited_email.trim().toLowerCase() };
}

export interface ToggleItineraryItemDoneBody {
  is_done: boolean;
}

export function validateToggleItineraryItemDone(body: unknown): ToggleItineraryItemDoneBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;
  if (typeof b["is_done"] !== "boolean") {
    throw new ValidationError("is_done must be a boolean.");
  }
  return { is_done: b["is_done"] };
}

export function validateAcceptShareInvite(body: unknown): AcceptShareInviteBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;
  const token = b["token"];

  if (typeof token !== "string" || token.trim().length < 16) {
    throw new ValidationError("token is required and must be at least 16 characters.");
  }

  return { token: token.trim() };
}
