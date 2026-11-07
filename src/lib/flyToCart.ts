/**
 * "Fly to cart" animation: a small copy of the product photo arcs from the card to the cart icon,
 * then the cart icon gives a little bounce. Elements that can receive it carry data-cart-target.
 */
function visibleCartTarget(): HTMLElement | null {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  // the navbar (desktop) and the bottom bar (phone) both exist; only one is visible at a time
  return targets.find((el) => el.getBoundingClientRect().width > 0) ?? null;
}

function bounce(el: HTMLElement) {
  el.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(0.92)" }, { transform: "scale(1)" }],
    { duration: 420, easing: "ease-out" }
  );
}

export function flyToCart(source: HTMLElement | null) {
  if (!source || typeof window === "undefined") return;
  const target = visibleCartTarget();
  if (!target) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bounce(target);
    return;
  }

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width || !from.height) return;

  const size = Math.min(from.width, from.height, 140);
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const dx = to.left + to.width / 2 - (startX + size / 2);
  const dy = to.top + to.height / 2 - (startY + size / 2);

  const flyer = document.createElement("div");
  Object.assign(flyer.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "14px",
    overflow: "hidden",
    zIndex: "9999",
    pointerEvents: "none",
    boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
    background: "#fff",
  });
  const img = document.createElement("img");
  img.src = (source as HTMLImageElement).currentSrc || (source as HTMLImageElement).src || "";
  img.alt = "";
  Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover" });
  flyer.appendChild(img);
  document.body.appendChild(flyer);

  const animation = flyer.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) scale(0.6)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.35, offset: 1 },
    ],
    { duration: 750, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
  );

  const done = () => {
    flyer.remove();
    bounce(target);
  };
  animation.onfinish = done;
  animation.oncancel = () => flyer.remove();
}