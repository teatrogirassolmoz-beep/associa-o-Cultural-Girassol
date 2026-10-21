"use client";
import { useEffect, useRef } from "react";

/** Original pigment field: responds to movement and taps without blocking page controls. */
export function PigmentCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current,
      context = element?.getContext("2d");
    if (!element || !context) return;
    const host = element.parentElement!,
      hero = host.closest<HTMLElement>(".festival-hero"),
      site = host.closest<HTMLElement>(".festival-site");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      last = performance.now(),
      time = 0,
      visible = true,
      disposed = false;
    const pointer = { x: 0.72, y: 0.44, active: false };
    let burst: { x: number; y: number; age: number } | null = null;
    let seed = 741;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const points = Array.from({ length: 1800 }, (_, i) => {
      const right = i % 2 === 0;
      return {
        x: (right ? 0.92 : 0.08) + (random() - 0.5) * 0.37,
        y: random() * 1.2 - 0.1,
        r: 0.3 + Math.pow(random(), 3) * 3.2,
        a: 0.13 + random() * 0.38,
        phase: random() * Math.PI * 2,
        color: right
          ? ["#ed278f", "#ff6b32", "#702a9c", "#128ec6"][Math.floor(i / 2) % 4]
          : ["#4a208e", "#992b9e", "#096e9a", "#ff794b"][Math.floor(i / 2) % 4],
      };
    });
    function draw() {
      if (!context || !width || !height) return;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";
      const drift = Math.sin(time * 0.18) * 0.015;
      for (let patch = 0; patch < 10; patch++) {
        const right = patch % 2 === 0;
        const cx = width * (right ? 1.02 : -0.02),
          cy = height * (0.1 + (patch % 5) * 0.21);
        context.globalAlpha = 0.08;
        context.fillStyle = [
          "#7a169e",
          "#0b78aa",
          "#d42685",
          "#f87531",
          "#382b91",
        ][patch % 5];
        context.beginPath();
        for (let n = 0; n <= 54; n++) {
          const angle = (n / 54) * Math.PI * 2;
          const ragged =
            1 +
            Math.sin(angle * 9 + patch) * 0.13 +
            Math.sin(angle * 23 + patch * 0.4) * 0.08;
          const radius = width * (width < 600 ? 0.28 : 0.15) * ragged;
          const x = cx + Math.cos(angle) * radius,
            y =
              cy +
              Math.sin(angle) * radius * 0.9 +
              Math.sin(time * 0.15 + patch) * 5;
          if (n === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
      }

      for (let ribbon = 0; ribbon < 18; ribbon++) {
        const right = ribbon % 2 === 0;
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#8422a9");
        gradient.addColorStop(0.45, "#087ca8");
        gradient.addColorStop(0.7, "#c92b86");
        gradient.addColorStop(1, "#ff813b");
        context.strokeStyle = gradient;
        context.lineWidth = 1 + (ribbon % 5) * 1.5;
        context.globalAlpha = 0.12 + (ribbon % 4) * 0.025;
        context.beginPath();
        for (let n = 0; n <= 60; n++) {
          const progress = n / 60,
            wave = Math.sin(progress * 5 + time * 0.12 + ribbon * 0.03) * 0.055;
          let x =
            (right
              ? 0.98 - wave - ribbon * 0.002
              : 0.02 + wave + ribbon * 0.002) * width;
          const y = (progress * 1.3 - 0.15) * height;
          if (pointer.active && !reduced.matches) {
            const influence = Math.max(
              0,
              1 - Math.abs(y - pointer.y * height) / 250,
            );
            x += (pointer.x - 0.5) * 15 * influence;
          }
          if (n === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }

      for (let i = 0; i < points.length; i++) {
        if (width < 600 && i % 4 > 1) continue;
        const p = points[i];
        let x = (p.x + Math.sin(time * 0.12 + p.phase) * 0.012) * width,
          y = (p.y + drift * Math.cos(p.phase)) * height;
        const dx = x - pointer.x * width,
          dy = y - pointer.y * height,
          distance = Math.hypot(dx, dy);
        if (
          pointer.active &&
          !reduced.matches &&
          site?.dataset.motionPaused !== "true" &&
          distance < 180
        ) {
          const force = (1 - distance / 180) * 19;
          x += (dx / Math.max(distance, 1)) * force;
          y += (dy / Math.max(distance, 1)) * force;
        }
        context.fillStyle = p.color;
        context.globalAlpha = p.a;
        context.beginPath();
        context.arc(x, y, p.r * (width < 600 ? 0.7 : 1), 0, Math.PI * 2);
        context.fill();
      }
      if (pointer.active && !reduced.matches) {
        const glow = context.createRadialGradient(
          pointer.x * width,
          pointer.y * height,
          0,
          pointer.x * width,
          pointer.y * height,
          190,
        );
        glow.addColorStop(0, "#e434891d");
        glow.addColorStop(1, "#e4348900");
        context.globalAlpha = 1;
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }
      if (burst && !reduced.matches) {
        for (let i = 0; i < 48; i++) {
          const angle = i * 2.399,
            r = burst.age * 120 * (0.45 + (i % 5) * 0.13);
          context.globalAlpha = Math.max(0, (1 - burst.age) * 0.65);
          context.fillStyle = ["#ffbd48", "#ef2699", "#42d8cf"][i % 3];
          context.beginPath();
          context.arc(
            burst.x + Math.cos(angle) * r,
            burst.y + Math.sin(angle) * r,
            1.5 + (i % 3),
            0,
            Math.PI * 2,
          );
          context.fill();
        }
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    }
    function animate(now: number) {
      frame = 0;
      if (
        disposed ||
        !visible ||
        reduced.matches ||
        site?.dataset.motionPaused === "true"
      )
        return;
      if (now - last > 49) {
        const delta = Math.min(now - last, 90) / 1000;
        time += delta;
        if (burst) {
          burst.age += delta;
          if (burst.age > 1) burst = null;
        }
        last = now;
        draw();
      }
      frame = requestAnimationFrame(animate);
    }
    function sync() {
      cancelAnimationFrame(frame);
      last = performance.now();
      draw();
      if (
        !disposed &&
        visible &&
        !reduced.matches &&
        site?.dataset.motionPaused !== "true"
      )
        frame = requestAnimationFrame(animate);
    }
    function resize() {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.3);
      element!.width = Math.round(width * ratio);
      element!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      sync();
    }
    function move(event: PointerEvent) {
      if (reduced.matches || site?.dataset.motionPaused === "true") return;
      const rect = host.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.active = true;
    }
    function leave() {
      pointer.active = false;
    }
    function tap(event: PointerEvent) {
      if (
        reduced.matches ||
        site?.dataset.motionPaused === "true" ||
        (event.target instanceof Element &&
          event.target.closest("a,button,input,select,summary,dialog"))
      )
        return;
      move(event);
      burst = { x: pointer.x * width, y: pointer.y * height, age: 0 };
    }
    const size = new ResizeObserver(resize);
    size.observe(host);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      sync();
    });
    intersection.observe(host);
    const mutation = new MutationObserver(sync);
    if (site)
      mutation.observe(site, {
        attributes: true,
        attributeFilter: ["data-motion-paused"],
      });
    reduced.addEventListener("change", sync);
    hero?.addEventListener("pointermove", move, { passive: true });
    hero?.addEventListener("pointerleave", leave);
    hero?.addEventListener("pointerdown", tap);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      size.disconnect();
      intersection.disconnect();
      mutation.disconnect();
      reduced.removeEventListener("change", sync);
      hero?.removeEventListener("pointermove", move);
      hero?.removeEventListener("pointerleave", leave);
      hero?.removeEventListener("pointerdown", tap);
    };
  }, []);
  return <canvas ref={canvas} className="pigment-canvas" aria-hidden="true" />;
}
