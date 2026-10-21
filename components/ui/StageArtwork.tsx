"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { ArtPoster } from "@/components/art/ArtPoster";
import { useSection, text, img } from "@/components/publicCms";
import { ManagedLogo } from "@/components/ui/ManagedLogo";
import { GirassolLogo } from "@/components/ui/GirassolLogo";
import { FitiLogo } from "@/components/ui/FitiLogo";
import { usePresentation } from "./SitePresentation";
import { MozambiqueMap } from "@/components/art/MozambiqueMap";

const defaultScenes = [
  { name: "Teatro", word: "CORPO", line: "O palco começa em nós.", variant: 0 },
  { name: "Encontro", word: "VOZ", line: "Muitas vozes. Um lugar de encontro.", variant: 1 },
  { name: "Movimento", word: "GESTO", line: "A cultura está sempre em movimento.", variant: 2 },
];

/** An interactive festival poster: illustration, paper and typography. */
export function StageArtwork({ fiti = false }: { fiti?: boolean }) {
  const presentation = usePresentation();
  const [scene, setScene] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const fields = useSection(fiti ? "fiti_hero" : "home_hero");
  const scenes = defaultScenes.map((item,index)=>({...item,name:text(fields[`scene_${index+1}_name`],item.name),word:text(fields[`scene_${index+1}_word`],item.word),line:text(fields[`scene_${index+1}_line`],item.line)}));
  const current = scenes[scene];
  const imageKey = scene === 0 ? "image" : `image_${scene + 1}`;
  const photo = img(fields[`${imageKey}_url`]);
  const [failedPhoto, setFailedPhoto] = useState("");
  useEffect(() => setFailedPhoto(""), [photo]);
  const hasPhoto = Boolean(photo) && photo !== failedPhoto;
  function move(event: PointerEvent<HTMLDivElement>) {
    if (presentation.cursor_interaction_enabled !== "true" || matchMedia("(prefers-reduced-motion: reduce)").matches || host.current?.closest<HTMLElement>(".festival-site")?.dataset.motionPaused === "true") return;
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
      <div className="cultural-paper cultural-paper-back" aria-hidden="true"><span>{text(fields.poster_back,"CULTURA É PRESENÇA.")}</span></div>
      <div className={`cultural-main-poster ${hasPhoto ? "cultural-main-photo" : ""}`} key={scene}>
        {hasPhoto ? <img className="cultural-photo" src={photo} alt={text(fields[`${imageKey}_alt`], current.name === "Teatro" ? "Teatro da Associação Cultural Girassol" : current.name)} onError={() => setFailedPhoto(photo)} /> : <ArtPoster variant={current.variant} title={current.name} />}
        <div className="cultural-poster-title" aria-hidden="true"><ManagedLogo settingKey={fiti ? "fiti_logo_url" : "site_logo_url"} alt={fiti ? "FITI" : "Associação Cultural Girassol"} className="cultural-poster-logo" fallback={fiti ? <FitiLogo compact/> : <GirassolLogo compact/>}/><span>{fiti ? "FITI" : "GIRASSOL"}</span><strong>{current.word}<br/>{text(fields.poster_suffix,"EM CENA.")}</strong></div>
        <span className="cultural-print-note">{text(fields.poster_note,"MOÇAMBIQUE / TEATRO VIVO")}</span>
      </div>
      <span className="cultural-sticker" aria-hidden="true">{text(fields.poster_sticker,"ARTE QUE NOS MOVE")}</span>
      {fiti && presentation.map_enabled === "true" && <div className="cultural-map"><MozambiqueMap /></div>}
      <span className="cultural-tape" aria-hidden="true" />
    </div>
    <div className="cultural-art-caption"><p aria-live="polite">{current.line}</p><ArrowUpRight size={20}/></div>
    <div className="cultural-scene-tabs" role="group" aria-label="Explorar os cartazes">
      {scenes.map((item, index) => <button key={item.name} type="button" aria-pressed={scene === index} onClick={() => setScene(index)}>{item.name}<ArrowUpRight size={14} aria-hidden="true"/></button>)}
    </div>
  </div>;
}
