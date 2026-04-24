import { getSupabaseAdminClient } from "./supabase";

type AuditEventType =
  | "account.created"
  | "account.deleted"
  | "profile.updated"
  | "data.exported"
  | "share.sent"
  | "share.accepted"
  | "plan.deleted"
  | "share.removed";

// Critical events that are always logged regardless of user's restrict_logging preference
const CRITICAL_EVENTS: Set<AuditEventType> = new Set([
  "account.created",
  "account.deleted",
  "data.exported",
]);

// Routine events that can be skipped if user opts out (Right to Object)
const ROUTINE_EVENTS: Set<AuditEventType> = new Set([
  "profile.updated",
  "share.sent",
  "share.accepted",
  "plan.deleted",
  "share.removed",
]);

export async function logAuditEvent(
  userId: string,
  eventType: AuditEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseAdminClient();

  // Check if user has opted out of logging (Right to Object)
  if (ROUTINE_EVENTS.has(eventType)) {
    try {
      const { data: profile } = await supabase
        .from("profile")
        .select("restrict_logging")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.restrict_logging) {
        // User has opted out of routine logging
        return;
      }
    } catch (err) {
      // If we can't check the preference, proceed with logging
      console.warn(`[audit] Failed to check restrict_logging for user ${userId}:`, err);
    }
  }

  try {
    const { error } = await supabase.from("audit_log").insert({
      user_id: userId,
      event_type: eventType,
      metadata: metadata || null,
    });

    if (error) {
      console.warn(`[audit] Failed to log ${eventType} for user ${userId}:`, error);
    }
  } catch (err) {
    // audit_log table may not exist if migration hasn't been applied
    console.warn(`[audit] audit_log table unavailable, skipping ${eventType} log`);
  }
}
