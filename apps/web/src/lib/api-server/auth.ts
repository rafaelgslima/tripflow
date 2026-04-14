import { getSupabaseAdminClient } from "./supabase";
import { UnauthorizedError } from "./errors";

export interface AuthenticatedUser {
  userId: string;
  email: string | null;
}

export function extractBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) {
    throw new UnauthorizedError("Missing Authorization header.");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (!scheme || scheme.toLowerCase() !== "bearer" || !token || !token.trim()) {
    throw new UnauthorizedError("Invalid Authorization header format.");
  }

  return token;
}

export async function getAuthenticatedUser(
  authorizationHeader: string | undefined,
): Promise<AuthenticatedUser> {
  const token = extractBearerToken(authorizationHeader);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError("Invalid or expired access token.");
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
  };
}
