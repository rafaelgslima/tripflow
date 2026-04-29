import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import { methodNotAllowed, sendError } from "@/lib/api-server/errors";
import { logAuditEvent } from "@/lib/api-server/audit";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "GET") {
    methodNotAllowed(res);
    return;
  }

  try {
    const user = await getAuthenticatedUser(req.headers.authorization);
    const supabase = getSupabaseAdminClient();

    console.log("[export-data] Starting export for user:", user.userId);

    const profileResult = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.userId)
      .maybeSingle();

    console.log("[export-data] Profile query done:", profileResult.error);

    const plansResult = await supabase
      .from("travel_plan")
      .select("*")
      .eq("owner_user_id", user.userId);

    console.log("[export-data] Plans query done:", plansResult.error);

    const sharesResult = await supabase
      .from("travel_plan_share")
      .select("*")
      .or(`invited_user_id.eq.${user.userId},invited_by_user_id.eq.${user.userId}`);

    console.log("[export-data] Shares query done:", sharesResult.error);

    let auditResult: { data: unknown[] | null; error: unknown } = { data: [], error: null };
    try {
      auditResult = await supabase
        .from("audit_log")
        .select("*")
        .eq("user_id", user.userId)
        .order("created_at", { ascending: false });
    } catch (err) {
      console.warn("[export-data] audit_log table not available:", err);
    }

    console.log("[export-data] Audit query done:", auditResult.error);

    if (profileResult.error) {
      console.error("[export-data] Profile error:", profileResult.error);
      throw profileResult.error;
    }
    if (plansResult.error) {
      console.error("[export-data] Plans error:", plansResult.error);
      throw plansResult.error;
    }
    if (sharesResult.error) {
      console.error("[export-data] Shares error:", sharesResult.error);
      throw sharesResult.error;
    }
    // Ignore audit_log errors if table doesn't exist (migration not applied yet)
    if (auditResult.error && (auditResult.error as Record<string, unknown>).code !== 'PGRST205') {
      console.error("[export-data] Audit error:", auditResult.error);
      throw auditResult.error;
    }

    const plans = plansResult.data || [];
    const planIds = plans.map((p: { id: string }) => p.id);

    let itineraryItems: unknown[] = [];
    if (planIds.length > 0) {
      const itemsResult = await supabase
        .from("itinerary_item")
        .select("*")
        .in("travel_plan_id", planIds);

      if (itemsResult.error) throw itemsResult.error;
      itineraryItems = itemsResult.data || [];
    }

    const plansWithItems = plans.map((plan: { id: string }) => ({
      ...plan,
      itinerary_items: itineraryItems.filter(
        (item: unknown) => (item as { travel_plan_id: string }).travel_plan_id === plan.id,
      ),
    }));

    const sharesSent = (sharesResult.data?.filter(
      (s: unknown) => (s as { invited_by_user_id: string }).invited_by_user_id === user.userId,
    ) || []).map((s: unknown) => {
      const share = s as Record<string, unknown>;
      // Remove collaborator's personal data (email) to comply with GDPR/LGPD data minimization
      const { invited_email, invited_by_user_id, ...sanitized } = share;
      return sanitized;
    });

    const sharesReceived = (sharesResult.data?.filter(
      (s: unknown) => (s as { invited_user_id: string }).invited_user_id === user.userId,
    ) || []).map((s: unknown) => {
      const share = s as Record<string, unknown>;
      // Remove collaborator's personal data (email) to comply with GDPR/LGPD data minimization
      const { invited_email, invited_by_user_id, ...sanitized } = share;
      return sanitized;
    });

    const exportData = {
      exported_at: new Date().toISOString(),
      profile: profileResult.data,
      travel_plans: plansWithItems,
      shares_sent: sharesSent,
      shares_received: sharesReceived,
      audit_log: auditResult.data,
    };

    await logAuditEvent(user.userId, "data.exported");

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="planutrip-data-export.json"',
    );
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(exportData);
  } catch (error) {
    sendError(res, error);
  }
}
