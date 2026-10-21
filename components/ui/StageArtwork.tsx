"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { ArtPoster } from "@/components/art/ArtPoster";
import { MozambiqueMap } from "@/components/art/MozambiqueMap";

const scenes = [
  { name: "Teatro", word: "CORPO", line: "O palco começa em nós.", variant: 0 },
  { name: "Encontro", word: "VOZ", line: "Muitas vozes. Um lugar de encontro.", variant: 1 },
  { name: "Movimento", word: "GESTO", line: "A cultura está sempre em movimento.", variant: 2 },
];

/** An interactive festival poster: illustration, paper and typography. */
export function StageArtwork({ fiti = false }: { fiti?: boolean }) {
  const [scene, setScene] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const current = scenes[scene];
  function move(event: PointerEvent<HTMLDivElement>) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || host.current?.closest<HTMLElement>(".festival-site")?.dataset.motionPaused === "true") return;
    const rect = event.currentTarget.getBoundingClientRect();
    host.current?.style.setProperty("--paper-x", `${((event.clientX - rect.left) / rect.width - .5) * 12}px`);
    host.current?.style.setProperty("--paper-y", `${((event.clientY - rect.top) / rect.height - .5) * 10}px`);
  }
  function reset() {
    host.current?.style.setProperty("--paper-x", "0px");
    host.current?.style.setProperty("--paper-y", "0px");
  }
  return <div ref={host} className="cultural-art" onPointerMove={move} onPointerLeave={reset}>
    <div className="cultural-poster-stack">
      <div className="cultural-paper cultural-paper-back" aria-hidden="true"><span>CULTURA<br/>É PRESENÇA.</span></div>
      <div className="cultural-main-poster" key={scene}>
        <ArtPoster variant={current.variant} title={current.name} />
        <div className="cultural-poster-title" aria-hidden="true"><span>{fiti ? "FITI" : "GIRASSOL"}</span><strong>{current.word}<br/>EM CENA.</strong></div>
        <span className="cultural-print-note">MOÇAMBIQUE / TEATRO VIVO</span>
      </div>
      <span className="cultural-sticker" aria-hidden="true">ARTE<br/>QUE NOS<br/>MOVE</span>
      {fiti && <div className="cultural-map"><MozambiqueMap /></div>}
      <span className="cultural-tape" aria-hidden="true" />
    </div>
    <div className="cultural-art-caption"><p aria-live="polite">{current.line}</p><ArrowUpRight size={20}/></div>
    <div className="cultural-scene-tabs" role="group" aria-label="Explorar os cartazes">
      {scenes.map((item, index) => <button key={item.name} type="button" aria-pressed={scene === index} onClick={() => setScene(index)}>{item.name}<ArrowUpRight size={14} aria-hidden="true"/></button>)}
    </div>
  </div>;
}
