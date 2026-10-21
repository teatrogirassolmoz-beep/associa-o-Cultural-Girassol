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
    <>
    {page && <div className="site-pigment-interaction" aria-hidden="true"><PigmentCanvas page /></div>}
    <div
      ref={layer}
      className={`living-backdrop ${page ? "living-backdrop-page" : "living-backdrop-hero"}`}
      aria-hidden="true"
    >
      {!page && <><PigmentCanvas /><div className="culture-cutouts"><i/><i/><i/></div><span className="pigment-interaction-hint">Mova o rato ou toque — dê cor ao palco.</span></>}
      <div className="future-parallax">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />

      </div>
    </div>
    </>
  );
}
