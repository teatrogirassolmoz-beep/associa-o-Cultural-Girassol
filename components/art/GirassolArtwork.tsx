"use client";

import type { CSSProperties } from "react";
import sunflower from "@/public/art/girassol-madeira.webp";

type Props = { variant?: number; title?: string; className?: string };
const palettes = ["#ffb266", "#ffdc57", "#8bd2b0", "#eeb2c8"];

/** Branded botanical artwork used only when no editorial photograph is supplied. */
export function GirassolArtwork({ variant = 0, title = "Arte e cultura", className = "" }: Props) {
  const index = ((variant % palettes.length) + palettes.length) % palettes.length;
  return (
    <div
      role="img"
      aria-label={`Composição artística Girassol — ${title}`}
      className={`art-poster girassol-artwork ${className}`}
      style={{ "--art-paper": palettes[index], "--art-angle": `${[-12, 14, -24, 28][index]}deg` } as CSSProperties}
    >
      <div className="girassol-artwork-grain" aria-hidden="true" />
      <div className="girassol-artwork-flower" aria-hidden="true">
        <img src={sunflower.src} width={sunflower.width} height={sunflower.height} alt="" loading="lazy" />
      </div>
    </div>
  );
}
