import { getSession } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  requireAuth?: boolean;
};

class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, requireAuth = true } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const session = await getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || "An error occurred",
      response.status,
      data
    );
  }

  return data;
}

// Auth API
export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    college: string;
  }) =>
    fetchApi("/auth/signup", {
      method: "POST",
      body: data,
      requireAuth: false,
    }),

  getProfile: () => fetchApi("/auth/profile"),

  updateProfile: (data: {
    name?: string;
    phone?: string;
    college?: string;
    avatar_url?: string;
  }) =>
    fetchApi("/auth/profile", {
      method: "PATCH",
      body: data,
    }),
};

// Sports API
export const sportsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    is_open?: boolean;
    search?: string;
    sort?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi(`/sports${query ? `?${query}` : ""}`, { requireAuth: false });
  },

  get: (slugOrId: string) =>
    fetchApi(`/sports/${slugOrId}`, { requireAuth: false }),

  create: (data: unknown) =>
    fetchApi("/sports", { method: "POST", body: data }),

  update: (id: string, data: unknown) =>
    fetchApi(`/sports/${id}`, { method: "PATCH", body: data }),

  toggleRegistration: (id: string) =>
    fetchApi(`/sports/${id}/toggle-registration`, { method: "POST" }),

  duplicate: (id: string) =>
    fetchApi(`/sports/${id}/duplicate`, { method: "POST" }),

  archive: (id: string) =>
    fetchApi(`/sports/${id}/archive`, { method: "POST" }),
};

// Registrations API
export const registrationsApi = {
  checkEligibility: (sportId: string) =>
    fetchApi(`/registrations/check/${sportId}`),

  getMine: (params?: { status?: string; include_past?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi(`/registrations/me${query ? `?${query}` : ""}`);
  },

  get: (id: string) => fetchApi(`/registrations/${id}`),

  create: (data: {
    sport_id: string;
    is_team?: boolean;
    team_name?: string;
    team_members?: Array<{
      name: string;
      email?: string;
      phone?: string;
      is_captain?: boolean;
    }>;
  }) =>
    fetchApi("/registrations", { method: "POST", body: data }),

  updateTeam: (
    id: string,
    data: {
      team_name?: string;
      team_members?: Array<{
        name: string;
        email?: string;
        phone?: string;
        is_captain?: boolean;
      }>;
    }
  ) =>
    fetchApi(`/registrations/${id}/team`, { method: "PATCH", body: data }),

  cancel: (id: string, reason?: string) =>
    fetchApi(`/registrations/${id}/cancel`, {
      method: "POST",
      body: { reason },
    }),
};

// Payments API
export const paymentsApi = {
  createOrder: (registrationId: string) =>
    fetchApi("/payments/create-order", {
      method: "POST",
      body: { registration_id: registrationId },
    }),

  verify: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    fetchApi("/payments/verify", { method: "POST", body: data }),

  getMine: () => fetchApi("/payments/me"),

  getReceipt: (id: string) => fetchApi(`/payments/${id}/receipt`),

  verifyOffline: (data: {
    registration_id: string;
    amount: number;
    verification_note?: string;
  }) =>
    fetchApi("/payments/verify-offline", { method: "POST", body: data }),

  refund: (id: string, data: { amount: number; reason: string }) =>
    fetchApi(`/payments/${id}/refund`, { method: "POST", body: data }),
};

// Notifications API
export const notificationsApi = {
  list: (params?: {
    unread_only?: boolean;
    limit?: number;
    cursor?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi(`/notifications${query ? `?${query}` : ""}`);
  },

  getUnreadCount: () => fetchApi("/notifications/unread-count"),

  markRead: (notificationIds?: string[]) =>
    fetchApi("/notifications/mark-read", {
      method: "POST",
      body: { notification_ids: notificationIds },
    }),

  broadcast: (data: {
    title: string;
    message: string;
    priority?: string;
    target?: { type: string; value?: string };
    send_email?: boolean;
  }) =>
    fetchApi("/notifications/broadcast", { method: "POST", body: data }),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => fetchApi("/analytics/dashboard"),
  getSports: () => fetchApi("/analytics/sports"),
  getSport: (id: string) => fetchApi(`/analytics/sport/${id}`),
  getColleges: () => fetchApi("/analytics/colleges"),
  getRevenue: (period?: string) =>
    fetchApi(`/analytics/revenue${period ? `?period=${period}` : ""}`),
  getTrends: () => fetchApi("/analytics/trends"),
};

// Admin API
export const adminApi = {
  getAuditLogs: (params?: {
    page?: number;
    limit?: number;
    user_id?: string;
    entity_type?: string;
    action?: string;
    from?: string;
    to?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi(`/admin/audit-logs${query ? `?${query}` : ""}`);
  },

  getColleges: (includeInactive?: boolean) =>
    fetchApi(
      `/admin/colleges${includeInactive ? "?include_inactive=true" : ""}`
    ),

  createCollege: (data: { name: string; short_name?: string; city?: string }) =>
    fetchApi("/admin/colleges", { method: "POST", body: data }),

  updateCollege: (
    id: string,
    data: { name?: string; short_name?: string; city?: string; is_active?: boolean }
  ) =>
    fetchApi(`/admin/colleges/${id}`, { method: "PATCH", body: data }),

  deleteCollege: (id: string) =>
    fetchApi(`/admin/colleges/${id}`, { method: "DELETE" }),

  getSettings: () => fetchApi("/admin/settings"),

  updateSettings: (data: Record<string, unknown>) =>
    fetchApi("/admin/settings", { method: "PATCH", body: data }),

  getRegistrations: (params?: {
    page?: number;
    limit?: number;
    sport_id?: string;
    status?: string;
    payment_status?: string;
    college?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi(`/admin/registrations${query ? `?${query}` : ""}`);
  },

  updateRegistration: (id: string, data: { status?: string }) =>
    fetchApi(`/admin/registrations/${id}`, { method: "PATCH", body: data }),

  bulkUpdateRegistrations: (data: {
    registration_ids: string[];
    status: string;
    reason?: string;
  }) =>
    fetchApi("/admin/registrations/bulk-update", {
      method: "POST",
      body: data,
    }),

  exportRegistrations: (params?: {
    sport_id?: string;
    status?: string;
    format?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi(`/admin/registrations/export${query ? `?${query}` : ""}`);
  },
};

export { ApiError };
