"use client";
import { formatPrice } from "@/lib/format";

interface Props {
  bounds: { min: number; max: number };
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onReset: () => void;
}

export default function PriceFilter({ bounds, value, onChange, onReset }: Props) {
  const span = Math.max(bounds.max - bounds.min, 1);
  const step = span > 5000 ? 50 : span > 500 ? 10 : 1;
  const [lo, hi] = value;
  const pct = (n: number) => ((n - bounds.min) / span) * 100;
  const disabled = bounds.max <= bounds.min;

  return (
    <section aria-labelledby="price-filter-title" className="rounded-box border border-base-300/70 bg-base-100 p-4">
      <div className="flex items-center justify-between">
        <h2 id="price-filter-title" className="font-semibold">Price range</h2>
        <button onClick={onReset} className="text-xs font-medium text-secondary hover:underline" disabled={disabled}>Reset</button>
      </div>

      <div className="dual-range mt-5">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-base-300" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input
          type="range" aria-label="Minimum price" min={bounds.min} max={bounds.max} step={step} value={lo} disabled={disabled}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        />
        <input
          type="range" aria-label="Maximum price" min={bounds.min} max={bounds.max} step={step} value={hi} disabled={disabled}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <label className="flex-1">
          <span className="sr-only">Min price</span>
          <input
            type="number" inputMode="numeric" className="input input-sm w-full" value={lo} min={bounds.min} max={hi} disabled={disabled}
            onChange={(e) => onChange([Math.max(bounds.min, Math.min(Number(e.target.value) || bounds.min, hi)), hi])}
          />
        </label>
        <span className="text-base-content/50">to</span>
        <label className="flex-1">
          <span className="sr-only">Max price</span>
          <input
            type="number" inputMode="numeric" className="input input-sm w-full" value={hi} min={lo} max={bounds.max} disabled={disabled}
            onChange={(e) => onChange([lo, Math.min(bounds.max, Math.max(Number(e.target.value) || bounds.max, lo))])}
          />
        </label>
      </div>
      <p className="mt-3 text-xs text-base-content/60">Showing {formatPrice(lo)} – {formatPrice(hi)}</p>
    </section>
  );
}
