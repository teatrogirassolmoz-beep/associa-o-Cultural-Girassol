"use client";
import { useEffect, useRef, useState } from "react";
import { safePublicHref } from "@/lib/community";
import { usePresentationSettings, usePresentation } from "./SitePresentation";
import { PigmentCanvas } from "./PigmentCanvas";

export function LivingBackdrop({ page = false }: { page?: boolean }) {
  const presentation = usePresentation();
  const settings=usePresentationSettings();
  const watermark=safePublicHref(settings.animated_logo_url);
  const [failedWatermark,setFailedWatermark]=useState('');
  const opacity=Number(settings.animated_logo_opacity), speed=Number(settings.animated_logo_speed);
  const animated = presentation.animated_background_enabled === "true";
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (page || !animated) return;
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
  }, [page, animated]);
  return (
    <>
    {page && presentation.cursor_interaction_enabled === "true" && <div className="site-pigment-interaction" aria-hidden="true"><PigmentCanvas page /></div>}
    <div
      ref={layer}
      className={`living-backdrop ${page ? "living-backdrop-page" : "living-backdrop-hero"}`}
      aria-hidden="true"
    >
      {!page && watermark && !watermark.startsWith('#') && watermark!==failedWatermark && ![false,'false'].includes(settings.animated_logo_enabled as boolean|string) && <img src={watermark} alt="" className="cms-background-watermark" style={{opacity:Number.isFinite(opacity)?Math.max(.01,Math.min(.25,opacity)):.08,animationDuration:`${Number.isFinite(speed)?Math.max(18,Math.min(120,speed)):42}s`}} onError={()=>setFailedWatermark(watermark)}/>}
      {!page && <>{animated && <PigmentCanvas />}<div className="culture-cutouts"><i/><i/><i/></div><span className="pigment-interaction-hint">{presentation.interaction_hint}</span></>}
      <div className="future-parallax" style={animated ? undefined : {animation: "none", transform: "none"}}>
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />

      </div>
    </div>
    </>
  );
}
