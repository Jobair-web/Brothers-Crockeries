"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["…", p] as const) : [p]));
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button className="btn btn-sm btn-ghost gap-1" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft size={16} /> Previous
      </button>
      <div className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-base-content/50">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`btn btn-sm btn-square ${p === page ? "btn-secondary" : "btn-ghost"}`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <p className="px-2 text-sm text-base-content/60 sm:hidden">Page {page} of {totalPages}</p>
      <button className="btn btn-primary gap-1 px-6" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Next <ChevronRight size={18} />
      </button>
    </nav>
  );
}
