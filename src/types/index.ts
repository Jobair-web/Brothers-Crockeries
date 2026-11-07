export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  isFeatured?: boolean;
  productCount?: number;
}

export interface ProductImage {
  url: string;
  fileId?: string;
  provider?: "cloudinary" | "imagekit" | "external";
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPercent: number;
  category?: { _id: string; name: string; slug: string } | null;
  brand?: string;
  images: ProductImage[];
  stock: number;
  inStock: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface ProductListResponse {
  products: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  priceRange: { min: number; max: number };
}

export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";
export type PaymentStatus = "unpaid" | "pending_verification" | "paid" | "rejected";
export type ShippingZone = "dhaka" | "chattogram" | "others";
export type PaymentMethod = "bkash_nagad" | "cod";

export interface OrderItem {
  product: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  district: string;
  postcode?: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | null;
  items: OrderItem[];
  billing: {
    firstName: string;
    lastName: string;
    company?: string;
    country: string;
    address: string;
    apartment?: string;
    city: string;
    district: string;
    postcode?: string;
    phone: string;
    email?: string;
  };
  shipToDifferentAddress?: boolean;
  shipping?: ShippingAddress;
  notes?: string;
  shippingZone: ShippingZone;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  payment?: { senderNumber?: string; transactionId?: string; verifiedAt?: string; verifiedBy?: string };
  status: OrderStatus;
  createdAt: string;
}

export interface Review {
  _id: string;
  name: string;
  location?: string;
  rating: number;
  comment: string;
  isApproved?: boolean;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: "user" | "admin";
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  maxQty: number;
}

export interface WishlistItem {
  _id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number;
  image?: string;
  inStock: boolean;
  stock: number;
}
