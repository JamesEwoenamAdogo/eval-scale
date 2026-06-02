import { format } from "date-fns";
export const ADMIN_API_BASE_URL = "https://munchezserver.onrender.com/api/v1";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
};

export type SignupMetric = {
  month: string;
  signups: number;
};

export type SalesAnalytics = {
  totalSales: number;
  totalOrders: number;
};

export type DashboardSummary = {
  totalRestaurants: number;
  totalOrders: number;
  totalSales: number;
};

export type LedgerItem = {
  date: string;
  amount: number;
  paid: boolean;
};

export type RestaurantCustomer = {
  _id: string;
  businessName: string;
  slug: string;
  logo: string;
  address: string;
  role: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  totalSales: number;
  commissionPercent: number;
  commission: LedgerItem[];
  payout: LedgerItem[];
  joinedAt: Date;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request failed");
  }

  return result.data;
}

export async function loginSuperAdmin(email: string, password: string) {
  return request<unknown>("/login/super-admin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getRestaurantSignups() {
  return request<SignupMetric[]>("/restaurant-signups");
}

export function getRestaurants() {
  return request<Omit<RestaurantCustomer, "joinedAt">[]>("/restaurants");
}

export function getDashboardSummary() {
  return request<DashboardSummary>("/dashboard-summary");
}

export function getSalesAnalytics(params: {
  filter?: "today" | "week" | "month";
  startDate?: string;
  endDate?: string;
} = {}) {
  const search = new URLSearchParams();

  if (params.filter) search.set("filter", params.filter);
  if (params.startDate) search.set("startDate", params.startDate);
  if (params.endDate) search.set("endDate", params.endDate);

  const query = search.toString();
  return request<SalesAnalytics>(`/sales-analytics${query ? `?${query}` : ""}`);
}

export function mapRestaurantToCustomer(
  restaurant: Omit<RestaurantCustomer, "joinedAt">
): RestaurantCustomer {
  const joinedAt = new Date(restaurant.createdAt);

  return {
    ...restaurant,
    email: restaurant.email ?? "",
    logo: restaurant.logo ?? "",
    address: restaurant.address ?? "",
    role: restaurant.role ?? "",
    totalSales: restaurant.totalSales ?? 0,
    commissionPercent: restaurant.commissionPercent ?? 0,
    commission: restaurant.commission ?? [],
    payout: restaurant.payout ?? [],
    joinedAt: Number.isNaN(joinedAt.getTime()) ? new Date() : joinedAt,
  };
}

export function formatApiDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}
