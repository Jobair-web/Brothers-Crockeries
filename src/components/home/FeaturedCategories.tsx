"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { ikResize } from "@/lib/imageUrl";
import type { Category } from "@/types";

const MAX_HOME_CATEGORIES = 10; // phone: 2 columns x 5 rows, desktop: 5 columns x 2 rows

// "contain" = the whole photo is shown on a white background (best for white-background product photos)
// "cover"   = the photo fills the box and the edges may be cropped
const FIT_MODE: "contain" | "cover" = "contain";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    api.categories
      .list()
      .then((r) => setCategories(r.categories.filter((c) => c.isFeatured !== false).slice(0, MAX_HOME_CATEGORIES)))
      .catch(() => setCategories([]));
  }, []);

  if (categories && categories.length === 0) return null;

  return (
    <section className="mx-auto mt-4 max-w-350 px-3 sm:mt-6 sm:px-4 lg:mt-10" aria-labelledby="featured-categories">
      <div className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="featured-categories" className="text-[22px] font-bold text-secondary sm:text-2xl">Shop by category</h2>
          <Link href="/products" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-secondary hover:underline">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {categories === null
            ? Array.from({ length: MAX_HOME_CATEGORIES }).map((_, i) => <div key={i} className="aspect-[20/19] animate-pulse rounded-2xl bg-base-200" />)
            : categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/categories/${c.slug}`}
                  className="group flex aspect-[20/19] flex-col overflow-hidden rounded-2xl border border-base-300/70 bg-white transition-transform duration-300 hover:scale-[1.03] hover:border-primary hover:shadow-lg hover:shadow-primary/15"
                >
                  {/* Picture takes all the space that is left */}
                  <span className="relative block min-h-0 flex-1 overflow-hidden bg-white">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ikResize(c.image, "w-640,q-85,f-auto")}
                        alt=""
                        loading="lazy"
                        className={`absolute inset-0 size-full transition-transform duration-500 ${
                          FIT_MODE === "contain" ? "object-contain group-hover:scale-105" : "object-cover group-hover:scale-110"
                        }`}
                      />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary/15 to-secondary/15 text-4xl font-bold text-secondary/60">
                        {c.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  {/* Name strip has a small fixed height */}
                  <span className="line-clamp-2 flex h-10 shrink-0 items-center justify-center bg-white px-2 text-center text-[13px] font-bold leading-tight text-secondary sm:text-[14px]">
                    {c.name}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}