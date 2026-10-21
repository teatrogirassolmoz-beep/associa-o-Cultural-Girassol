"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Orbit } from "lucide-react";

import { BrandSun } from "@/components/art/BrandSun";

const dimensions = ["Pulso solar", "Órbita líquida", "Campo magnético"];

/** A projected, iridescent sculpture. No WebGL, downloads or external assets. */
export function StageArtwork({ fiti = false }: { fiti?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [dimension, setDimension] = useState(fiti ? 1 : 0);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const host = element.parentElement!;
    const site = host.closest<HTMLElement>(".festival-site");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      elapsed = 0;
    let last = performance.now(),
      visible = true,
      disposed = false;
    const pointer = { x: 0, y: 0 };
    const palette =
      dimension === 1
        ? ["#ff5f87", "#7b3cff", "#00cbbc"]
        : dimension === 2
          ? ["#fd782b", "#5333ff", "#da45ff"]
          : ["#ef8a40", "#9851d5", "#00bca7"];

    function project(u: number, v: number, time: number) {
      const major =
        dimension === 1
          ? 1.03 + Math.sin(u * 2 + time * 0.3) * 0.19
          : dimension === 2
            ? 1.22 + Math.sin(u * 5 + time * 0.4) * 0.23
            : 1.25 + Math.sin(u * 3 + time * 0.4) * 0.13;
      const minor =
        dimension === 1
          ? 0.57 + 0.1 * Math.sin(u * 4 + time * 0.4)
          : dimension === 2
            ? 0.31 + 0.09 * Math.sin(u * 5 + time * 0.6)
            : 0.43 + 0.065 * Math.sin(u * 6 + time * 0.6);
      let x = (major + minor * Math.cos(v)) * Math.cos(u);
      let y = (major + minor * Math.cos(v)) * Math.sin(u);
      let z = minor * Math.sin(v) + Math.sin(u * 3 + time * 0.3) * 0.12;
      const tilt = 0.52 + Math.sin(time * 0.2) * 0.16 + pointer.y * 0.13;
      const turn = -0.28 + Math.sin(time * 0.13) * 0.2 + pointer.x * 0.16;
      const yy = y * Math.cos(tilt) - z * Math.sin(tilt);
      z = y * Math.sin(tilt) + z * Math.cos(tilt);
      y = yy;
      const xx = x * Math.cos(turn) + z * Math.sin(turn);
      z = -x * Math.sin(turn) + z * Math.cos(turn);
      x = xx;
      const rotation = time * 0.08 + (dimension === 1 ? 0.45 : -0.35);
      const scale = Math.min(width, height) * 0.24 * (4.5 / (4.5 - z));
      return {
        x:
          width / 2 + (x * Math.cos(rotation) - y * Math.sin(rotation)) * scale,
        y:
          height / 2 +
          (x * Math.sin(rotation) + y * Math.cos(rotation)) * scale,
        z,
      };
    }

    function draw(time: number) {
      if (!context || !width || !height) return;
      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        width * 0.47,
      );
      glow.addColorStop(0, "#ac82ff22");
      glow.addColorStop(0.65, "#66eee426");
      glow.addColorStop(1, "#ffffff00");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      const mobile = width < 450;
      const loops = mobile ? 24 : 40,
        segments = mobile ? 72 : 112;
      const gradient = context.createLinearGradient(
        0,
        height * 0.2,
        width,
        height * 0.8,
      );
      gradient.addColorStop(0, palette[0]);
      gradient.addColorStop(0.48, palette[1]);
      gradient.addColorStop(1, palette[2]);
      for (let ring = 0; ring < loops; ring++) {
        const v = (ring / loops) * Math.PI * 2;
        context.strokeStyle = gradient;
        context.lineWidth = ring % 5 === 0 ? 1.8 : 0.8;
        context.globalAlpha = 0.5 + Math.sin(v) * 0.22;
        context.beginPath();
        for (let i = 0; i <= segments; i++) {
          const p = project((i / segments) * Math.PI * 2, v, time);
          if (i === 0) context.moveTo(p.x, p.y);
          else context.lineTo(p.x, p.y);
        }
        context.closePath();
        context.stroke();
      }
      context.globalAlpha = 0.18;
      context.strokeStyle = palette[0];
      context.lineWidth = 0.65;
      for (let longitude = 0; longitude < (mobile ? 30 : 52); longitude++) {
        context.beginPath();
        for (let j = 0; j <= 32; j++) {
          const p = project(
            (longitude / (mobile ? 30 : 52)) * Math.PI * 2,
            (j / 32) * Math.PI * 2,
            time,
          );
          if (j === 0) context.moveTo(p.x, p.y);
          else context.lineTo(p.x, p.y);
        }
        context.stroke();
      }
      context.globalAlpha = 0.8;
      for (let i = 0; i < 18; i++) {
        const angle = i * 2.399 + time * 0.07;
        const r = Math.min(width, height) * (0.42 + (i % 3) * 0.025);
        const x = width / 2 + Math.cos(angle) * r,
          y = height / 2 + Math.sin(angle) * r * 0.85;
        context.fillStyle = palette[i % 3];
        context.beginPath();
        context.arc(x, y, i % 4 === 0 ? 2.5 : 1.2, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    }
    function animate(now: number) {
      frame = 0;
      if (
        disposed ||
        reduced.matches ||
        site?.dataset.motionPaused === "true" ||
        !visible
      )
        return;
      if (now - last >= 32) {
        elapsed += Math.min(now - last, 64) / 1000;
        last = now;
        draw(elapsed);
      }
      frame = requestAnimationFrame(animate);
    }
    function sync() {
      cancelAnimationFrame(frame);
      last = performance.now();
      draw(elapsed);
      if (
        !disposed &&
        !reduced.matches &&
        visible &&
        site?.dataset.motionPaused !== "true"
      )
        frame = requestAnimationFrame(animate);
    }
    function resize() {
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      element!.width = Math.round(width * ratio);
      element!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      sync();
    }
    function move(event: PointerEvent) {
      if (
        event.pointerType === "touch" ||
        reduced.matches ||
        site?.dataset.motionPaused === "true"
      )
        return;
      const bounds = host.getBoundingClientRect();
      pointer.x = Math.max(
        -1,
        Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1),
      );
      pointer.y = Math.max(
        -1,
        Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      );
    }
    function leave() {
      pointer.x = 0;
      pointer.y = 0;
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const visibility = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      sync();
    });
    visibility.observe(host);
    const motion = new MutationObserver(sync);
    if (site)
      motion.observe(site, {
        attributes: true,
        attributeFilter: ["data-motion-paused"],
      });
    reduced.addEventListener("change", sync);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      motion.disconnect();
      reduced.removeEventListener("change", sync);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [dimension]);

  return (
    <div className={`stage-art quantum-art ${fiti ? "quantum-art-fiti" : ""}`}>
      <div
        className="portal-coordinate portal-coordinate-top"
        aria-hidden="true"
      >
        <span>25°58′ S / 32°35′ E</span>
        <span>MAPUTO ↗ MUNDO</span>
      </div>
      <div className="portal-sculpture">
        <canvas ref={canvas} aria-hidden="true" className="portal-canvas" />
        <div className="portal-heart" aria-hidden="true">
          <span>
            <BrandSun />
          </span>
          <small>
            {fiti ? "FITI / TEATRO SEM FRONTEIRAS" : "GIRASSOL / TEATRO VIVO"}
          </small>
        </div>
      </div>
      <span className="portal-orbit-word" aria-hidden="true">
        {fiti ? "SEM FRONTEIRAS" : "O FUTURO TEM RAÍZES"}
      </span>
      <div className="portal-console">
        <p aria-live="polite">
          <span className="portal-status" />
          {dimensions[dimension]}
          <small>0{dimension + 1} / 03</small>
        </p>
        <button
          type="button"
          onClick={() => setDimension((dimension + 1) % dimensions.length)}
        >
          <Orbit size={17} />
          <span>Mudar energia</span>
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
