import { API_URL } from "./constants";
import { authClient } from "./auth-client";
import type {
  AdminUser, Category, Order, OrderStatus, PaymentMethod, Product, ProductImage, ProductListResponse, Review, ShippingAddress, ShippingZone,
} from "@/types";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: { path: string; message: string }[]) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;
interface Options {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  query?: Query;
  /** true = token required, "optional" = attach when signed in */
  auth?: boolean | "optional";
}

async function getToken(): Promise<string | null> {
  try {
    const { data } = await authClient.getSession();
    return data?.session?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, { method = "GET", body, form, query, auth }: Options = {}): Promise<T> {
  const qs = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });

  const headers: Record<string, string> = {};
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (auth === true) throw new ApiError(401, "Please sign in to continue");
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}${qs.size ? `?${qs}` : ""}`, {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message ?? "Something went wrong", data.details);
  return data as T;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  inStock?: boolean;
  featured?: boolean;
  featuredLast?: boolean;
}

export interface ProductInput {
  title: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  brand?: string;
  stock: number;
  inStock: boolean;
  isFeatured?: boolean;
  images: ProductImage[];
}

export interface OrderInput {
  items: { productId: string; quantity: number }[];
  billing: Order["billing"];
  shipping?: ShippingAddress;
  notes?: string;
  shippingZone: ShippingZone;
  paymentMethod: PaymentMethod;
  payment?: { senderNumber?: string; transactionId?: string };
}

export const api = {
  products: {
    list: (query: ProductQuery = {}) => request<ProductListResponse>("/products", { query: { ...query } }),
    get: (idOrSlug: string) => request<{ product: Product }>(`/products/${idOrSlug}`),
    create: (body: ProductInput) => request<{ product: Product }>("/products", { method: "POST", body, auth: true }),
    update: (id: string, body: Partial<ProductInput>) => request<{ product: Product }>(`/products/${id}`, { method: "PUT", body, auth: true }),
    remove: (id: string) => request<{ message: string }>(`/products/${id}`, { method: "DELETE", auth: true }),
  },
  categories: {
    list: () => request<{ categories: Category[] }>("/categories"),
    create: (body: Partial<Category>) => request<{ category: Category }>("/categories", { method: "POST", body, auth: true }),
    update: (id: string, body: Partial<Category>) => request<{ category: Category }>(`/categories/${id}`, { method: "PUT", body, auth: true }),
    remove: (id: string) => request<{ message: string }>(`/categories/${id}`, { method: "DELETE", auth: true }),
  },
  orders: {
    create: (body: OrderInput) => request<{ order: Order }>("/orders", { method: "POST", body, auth: "optional" }),
    mine: () => request<{ orders: Order[] }>("/orders/mine", { auth: true }),
    get: (idOrNumber: string) => request<{ order: Order }>(`/orders/${idOrNumber}`, { auth: true }),
    list: (query: { page?: number; status?: string; search?: string } = {}) =>
      request<{ orders: Order[]; page: number; totalPages: number; total: number }>("/orders", { query, auth: true }),
    setStatus: (id: string, status: OrderStatus) => request<{ order: Order }>(`/orders/${id}/status`, { method: "PATCH", body: { status }, auth: true }),
    verifyPayment: (id: string, action: "verify" | "reject") =>
      request<{ order: Order }>(`/orders/${id}/payment`, { method: "PATCH", body: { action }, auth: true }),
  },
  wishlist: {
    get: () => request<{ products: Product[] }>("/wishlist", { auth: true }),
    add: (productId: string) => request<{ products: Product[] }>(`/wishlist/${productId}`, { method: "POST", auth: true }),
    remove: (productId: string) => request<{ products: Product[] }>(`/wishlist/${productId}`, { method: "DELETE", auth: true }),
    merge: (productIds: string[]) => request<{ products: Product[] }>("/wishlist/merge", { method: "POST", body: { productIds }, auth: true }),
  },
  reviews: {
    list: () => request<{ reviews: Review[] }>("/reviews"),
    create: (body: { name: string; location?: string; rating: number; comment: string }) =>
      request<{ review: Review; message: string }>("/reviews", { method: "POST", body, auth: true }),
    listAll: () => request<{ reviews: Review[] }>("/reviews/all", { auth: true }),
    setApproval: (id: string, isApproved: boolean) => request<{ review: Review }>(`/reviews/${id}/approval`, { method: "PATCH", body: { isApproved }, auth: true }),
    remove: (id: string) => request<{ message: string }>(`/reviews/${id}`, { method: "DELETE", auth: true }),
  },
  users: {
    list: () => request<{ users: AdminUser[] }>("/users", { auth: true }),
    setRole: (id: string, role: "user" | "admin") => request<{ user: AdminUser }>(`/users/${id}/role`, { method: "PATCH", body: { role }, auth: true }),
    remove: (id: string) => request<{ message: string }>(`/users/${id}`, { method: "DELETE", auth: true }),
  },
  upload: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    return request<{ images: ProductImage[] }>("/upload", { method: "POST", form, auth: true });
  },
  admin: {
    stats: () =>
      request<{
        stats: { orders: number; products: number; users: number; revenue: number; pendingOrders: number; pendingPayments: number; lowStock: number };
        recentOrders: Order[];
      }>("/admin/stats", { auth: true }),
  },
};
