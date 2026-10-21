"use client";

import { useEffect, useRef } from "react";

/** Painted scenery, independent from the text and from the CMS content. */
export function LivingBackdrop({ page = false }: { page?: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (page || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    function move(event: PointerEvent) {
      if (event.pointerType === "touch") return;
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
      <div className="paint-parallax">
        <span className="paint-cloud paint-cloud-coral" />
        <span className="paint-cloud paint-cloud-sun" />
        <span className="paint-cloud paint-cloud-lilac" />
        <svg
          className="paint-ribbon"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <path d="M-120 720C170 300 300 1030 650 620S1060 70 1560 280" />
          <path d="M-100 780C170 360 300 1090 650 680S1060 130 1560 340" />
        </svg>
        <svg className="paint-doodles" viewBox="0 0 1440 900">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M90 140l12-28m-4 42 30-10m-43 6-21-15M1200 650q-80 30 0 60t0 60M620 70q30-30 60 0t60 0" />
            <circle cx="1350" cy="180" r="20" />
            <path d="m530 770 12-24 12 24 26 4-19 19 4 26-23-12-23 12 4-26-19-19z" />
          </g>
        </svg>
      </div>
      <div className="paint-grain" />
    </div>
  );
}
