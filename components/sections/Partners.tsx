"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Pause, Play, Handshake } from "lucide-react";
import { usePublicRows } from "@/hooks/usePublicRows";
import { useSection, text } from "@/components/publicCms";
import { isSupabaseConfigured } from "@/lib/supabase";
import { safePublicHref } from "@/lib/community";

type Partner = {
  id?: string;
  name: string;
  category?: string;
  logo_url?: string;
  link?: string;
};

function PartnerTile({ partner, duplicate }: { partner: Partner; duplicate: boolean }) {
  const [failed, setFailed] = useState("");
  const logo = safePublicHref(partner.logo_url);
  const href = safePublicHref(partner.link);
  const content = <>
    {logo && !logo.startsWith("#") && failed !== logo ? <img src={logo} alt={duplicate ? "" : partner.name} loading="lazy" decoding="async" onError={() => setFailed(logo)} /> : <span className="partner-name-mark">{partner.name}</span>}
    <span className="partner-tile-caption"><span>{partner.category || partner.name}</span>{href && <ArrowUpRight size={14} aria-hidden="true" />}</span>
  </>;
  return href ? <Link href={href} className="partner-conveyor-tile" tabIndex={duplicate ? -1 : undefined} aria-label={duplicate ? undefined : `Visitar ${partner.name}`}>{content}</Link> : <div className="partner-conveyor-tile">{content}</div>;
}

export function Partners({ fiti = false }: { fiti?: boolean }) {
  const fields = useSection(fiti ? "fiti_partners" : "home_partners");
  const { data: rows, loading, error, refresh } = usePublicRows<Partner>("partners", [], q => q.eq("is_active", true).eq(fiti ? "show_on_fiti" : "show_on_home", true).order("order_index"));
  const [paused, setPaused] = useState(false);
  const moving = rows.length > 1;
  const failed = Boolean(error) && isSupabaseConfigured;
  return <section id="parceiros" className={`partner-conveyor ${paused ? "is-paused" : ""} ${moving ? "is-moving" : ""}`} aria-labelledby="partner-conveyor-title" aria-busy={loading}>
    <div className="partner-conveyor-heading">
      <div><p className="festival-eyebrow">{text(fields.eyebrow, "A CULTURA FAZ-SE EM CONJUNTO")}</p><h2 id="partner-conveyor-title">{text(fields.section_title, "Parceiros e apoios")}</h2></div>
      {moving && <button type="button" className="partner-motion-toggle" aria-pressed={paused} aria-label={paused ? "Retomar movimento dos parceiros" : "Pausar movimento dos parceiros"} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} /> : <Pause size={16} />}<span>{paused ? "Retomar" : "Pausar"}</span></button>}
    </div>
    {rows.length ? <div className="partner-conveyor-window"><div className="partner-conveyor-track">{[0, ...(moving ? [1] : [])].map(copy => <div className="partner-conveyor-copy" key={copy} aria-hidden={copy === 1 ? true : undefined}>{rows.map((partner, index) => <PartnerTile key={partner.id || index} partner={partner} duplicate={copy === 1} />)}</div>)}</div></div> : <div className="partner-conveyor-empty"><Handshake size={27} aria-hidden="true"/><p>{loading ? "A carregar parceiros…" : failed ? "Não foi possível carregar os parceiros." : "Os parceiros e apoios serão anunciados aqui."}</p>{failed && <button type="button" onClick={() => void refresh()}>Tentar novamente</button>}</div>}
  </section>;
}
