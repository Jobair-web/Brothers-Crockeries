"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Every banner image should be 2:1 (e.g. 1600 x 800 px). Put the files in client/public.
const SLIDES = [
  { src: "/hero-banner-1.png", alt: "New Brothers Crockeries – everything your home needs" },
  { src: "/hero-banner-2.jpg", alt: "Modern appliances and crockeries for your home" },
  { src: "/hero-banner-3.png", alt: "New Brothers Crockeries shop card with contact numbers" },
  { src: "/hero-banner-4.png", alt: "Banner 4" }, // alt text ta nijer moto likho
  { src: "/hero-banner-5.png", alt: "Banner 5" },
  { src: "/hero-banner-6.png", alt: "Banner 6" },
  { src: "/hero-banner-7.png", alt: "Banner 7" },
];
const N = SLIDES.length;
// The first slide is repeated at the end so the last -> first move is also right to left.
const TRACK = [...SLIDES, SLIDES[0]];
const INTERVAL_MS = 2500;
const SLIDE_MS = 700;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0); // 0..N (N = clone of slide 0)
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => next(), INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, index]);

  const next = () => {
    if (busy.current || index >= N) return;
    busy.current = true;
    setAnimate(true);
    setIndex(index + 1);
  };

  const prev = () => {
    if (busy.current) return;
    busy.current = true;
    if (index === 0) {
      // jump (without animation) to the clone, then slide back to the last slide
      setAnimate(false);
      setIndex(N);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(N - 1);
        })
      );
    } else {
      setAnimate(true);
      setIndex(index - 1);
    }
  };

  const goTo = (i: number) => {
    if (busy.current || i === index % N) return;
    busy.current = true;
    setAnimate(true);
    setIndex(i);
  };

  const onTransitionEnd = () => {
    busy.current = false;
    if (index === N) {
      // reached the clone -> silently reset to the real first slide
      setAnimate(false);
      setIndex(0);
    }
  };

  const active = index % N;
  const arrow = "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-[#0b3d3a]/90 text-white shadow-md transition-colors hover:bg-[#0b3d3a] sm:size-11";

  return (
    // Same width and side padding as the navbar and the "Shop by category" section
    <div className="mx-auto max-w-350 px-3 pt-2 sm:px-4 sm:pt-3 lg:pt-4">
      <section
        aria-roledescription="carousel"
        aria-label="Featured banners"
        className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-neutral"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          className="flex size-full"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animate ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {TRACK.map((s, i) => {
            const isClone = i === N;
            const isActive = i === index;
            return (
              <Link
                key={`${s.src}-${i}`}
                href="/products"
                tabIndex={isActive && !isClone ? 0 : -1}
                aria-hidden={!isActive || isClone}
                className="size-full shrink-0 basis-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={isClone ? "" : s.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                  className="size-full object-cover"
                />
              </Link>
            );
          })}
        </div>

        <button onClick={prev} aria-label="Previous slide" className={`${arrow} left-3`}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} aria-label="Next slide" className={`${arrow} right-3`}>
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white"}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}