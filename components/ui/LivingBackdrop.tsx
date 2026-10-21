"use client";
import { useEffect, useRef } from "react";
import { PigmentCanvas } from "./PigmentCanvas";

export function LivingBackdrop({ page = false }: { page?: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (page) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function move(event: PointerEvent) {
      if (reduced.matches || event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layer.current?.style.setProperty(
          "--pointer-x",
          `${(event.clientX / innerWidth - 0.5) * 24}px`,
        );
        layer.current?.style.setProperty(
          "--pointer-y",
          `${(event.clientY / innerHeight - 0.5) * 18}px`,
        );
      });
    }
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [page]);
  return (
    <div
      ref={layer}
      className={`living-backdrop ${page ? "living-backdrop-page" : "living-backdrop-hero"}`}
      aria-hidden="true"
    >
      {!page && <PigmentCanvas />}
      <div className="future-parallax">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="future-grid" />
        <div className="future-horizon" />
        <div className="future-stars">
          {Array.from({ length: 14 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${(i * 37 + 9) % 100}%`,
                top: `${(i * 23 + 13) % 100}%`,
                animationDelay: `${-i * 0.7}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
