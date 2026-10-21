"use client";
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
export function MotionControl() {
  const [paused, setPaused] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  function toggle() {
    const next = !paused;
    const site = button.current?.closest<HTMLElement>(".festival-site");
    if (site) site.dataset.motionPaused = String(next);
    setPaused(next);
  }
  return (
    <button
      ref={button}
      type="button"
      className="scenery-control"
      aria-pressed={paused}
      onClick={toggle}
    >
      {paused ? <Play size={14} /> : <Pause size={14} />}
      <span>{paused ? "Retomar movimento" : "Pausar movimento"}</span>
    </button>
  );
}
