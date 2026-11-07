import {
  Blend, Coffee, CookingPot, Droplets, Fan, Flame, Microwave, Package, Refrigerator, Soup, SprayCan, Utensils, Zap,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  "cooking-pot": CookingPot,
  soup: Soup,
  blend: Blend,
  droplets: Droplets,
  microwave: Microwave,
  "spray-can": SprayCan,
  coffee: Coffee,
  package: Package,
  zap: Zap,
  fan: Fan,
  refrigerator: Refrigerator,
  flame: Flame,
};

export const ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function CategoryIcon({ name, size = 28 }: { name?: string; size?: number }) {
  const Icon = (name && CATEGORY_ICONS[name]) || Package;
  return <Icon size={size} strokeWidth={1.6} />;
}
