// Notification Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createUserClient,
  createAdminClient,
  corsResponse,
  error,
  success,
  parseBody,
  validateRequired,
  getCurrentUser,
  isAdmin,
  getQueryParams,
  createAuditLog,
} from "../_shared/utils.ts";
import { sendEmail } from "../_shared/email.ts";

interface MarkReadRequest {
  notification_ids?: string[];
}

interface BroadcastRequest {
  title: string;
  message: string;
  priority?: string;
  target?: {
    type: "all" | "sport" | "college";
    value?: string;
  };
  send_email?: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const action = pathParts.length > 1 ? pathParts[1] : null;

  // GET /notifications - Get user notifications
  if (req.method === "GET" && !action) {
    const user = await getCurrentUser(req);

    if (!user) {
      return error("Unauthorized", 401);
    }

    const supabase = createUserClient(req);
    const params = getQueryParams(req);
    const unreadOnly = params.get("unread_only") === "true";
    const parsedLimit = parseInt(params.get("limit") || "20", 10);
    const limit = Math.min(50, Number.isNaN(parsedLimit) ? 20 : parsedLimit);
    const cursor = params.get("cursor");

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: notifications, error: fetchError } = await query;

    if (fetchError) {
      return error("Failed to fetch notifications", 500);
    }

    const nextCursor =
      notifications && notifications.length === limit
        ? notifications[notifications.length - 1].created_at
        : null;

    return success({
      notifications,
      next_cursor: nextCursor,
    });
  }

  // GET /notifications/unread-count - Get unread count
  if (req.method === "GET" && action === "unread-count") {
    const user = await getCurrentUser(req);

    if (!user) {
      return error("Unauthorized", 401);
    }

    const supabase = createUserClient(req);

    const { count, error: countError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (countError) {
      return error("Failed to get count", 500);
    }

    return success({ unread_count: count || 0 });
  }

  // POST /notifications/mark-read - Mark as read
  if (req.method === "POST" && action === "mark-read") {
    const user = await getCurrentUser(req);

    if (!user) {
      return error("Unauthorized", 401);
    }

    const body = await parseBody<MarkReadRequest>(req);
    const supabase = createUserClient(req);

    let query = supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("recipient_id", user.id);

    if (body?.notification_ids && body.notification_ids.length > 0) {
      query = query.in("id", body.notification_ids);
    }

    const { error: updateError } = await query;

    if (updateError) {
      return error("Failed to mark notifications as read", 500);
    }

    return success({ message: "Notifications marked as read" });
  }

  // POST /notifications/broadcast - Broadcast notification (admin)
  if (req.method === "POST" && action === "broadcast") {
    try {
      if (!(await isAdmin(req))) {
        return error("Unauthorized", 403);
      }

      const user = await getCurrentUser(req);
      
      // Ensure user is authenticated
      if (!user) {
        return error("Unable to identify user", 401);
      }
      
      const body = await parseBody<BroadcastRequest>(req);

      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, ["title", "message"]);
      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      const adminClient = createAdminClient();

      // Build recipient list based on target
      let recipientQuery = adminClient.from("profiles").select("id, email, name");

      if (body.target?.type === "sport" && body.target.value) {
        // Get users registered for specific sport
        const { data: registrations } = await adminClient
          .from("registrations")
          .select("participant_id")
          .eq("sport_id", body.target.value)
          .eq("status", "confirmed");

        const participantIds = registrations?.map((r) => r.participant_id) || [];
        if (participantIds.length === 0) {
          return success({ message: "No recipients found", count: 0 });
        }
        recipientQuery = recipientQuery.in("id", participantIds);
      } else if (body.target?.type === "college" && body.target.value) {
        recipientQuery = recipientQuery.eq("college", body.target.value);
      }

      const { data: recipients, error: recipientError } = await recipientQuery;

      if (recipientError || !recipients || recipients.length === 0) {
        return success({ message: "No recipients found", count: 0 });
      }

      // Create notifications for all recipients
      const notifications = recipients.map((recipient) => ({
        recipient_id: recipient.id,
        type: "announcement",
        priority: body.priority || "normal",
        title: body.title,
        message: body.message,
      }));

      // Batch insert notifications
      const { error: insertError } = await adminClient
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Insert notifications error:", insertError);
        return error("Failed to send notifications", 500);
      }

      // Send emails if requested
      if (body.send_email) {
        // HTML escape utility for email content
        const escapeHtml = (str: string): string => {
          return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        };
        
        const year = new Date().getFullYear();
        const safeTitle = escapeHtml(body.title);
        const safeMessage = escapeHtml(body.message);
        
        const emailPromises = recipients.map((recipient) =>
          sendEmail({
            to: recipient.email,
            subject: body.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">${safeTitle}</h2>
                <p>${safeMessage}</p>
                <hr style="margin: 20px 0;" />
                <p style="color: #666; font-size: 12px;">Sports Fest ${year}</p>
              </div>
            `,
          }).catch((err) => console.error(`Email to recipient ${recipient.id} failed:`, err))
        );

        // Don't wait for all emails to complete
        Promise.all(emailPromises).catch(console.error);
      }

      // Create audit log
      await createAuditLog(
        adminClient,
        user.id,
        "BROADCAST_NOTIFICATION",
        "notifications",
        null,
        null,
        {
          title: body.title,
          recipient_count: recipients.length,
          target: body.target,
          send_email: body.send_email,
        },
        req
      );

      return success({
        message: "Broadcast sent successfully",
        count: recipients.length,
      });
    } catch (err) {
      console.error("Broadcast error:", err);
      return error("Failed to send broadcast", 500);
    }
  }

  return error("Not found", 404);
});
