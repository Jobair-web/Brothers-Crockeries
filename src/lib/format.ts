export const formatPrice = (n: number) => `৳${Math.round(n).toLocaleString("en-US")}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const PLACEHOLDER_IMAGE = "https://placehold.co/600x600/e6f7fb/12113a/png?text=No+image";
