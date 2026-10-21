"use client";
import Link from "next/link";
import { ArrowUpRight, Pause, Play, ChevronUp, Minus, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { announcements } from "@/lib/community";
import { useThemeSettings } from "@/hooks/useThemeSettings";
export function AnnouncementRibbon() {
  const { settings } = useThemeSettings();
  const items = announcements(settings.announcement_items);
  const [paused, setPaused] = useState(false);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  if (!items.length) return null;
  return (
    <aside
      className={`announcement-ribbon floating-notices ${paused ? "is-paused" : ""} ${compact ? "is-compact" : ""}`}
      onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); trigger.current?.focus(); } }}
      aria-label="Avisos e oportunidades"
    >
      {open && <div id={panelId} className="floating-notices-panel">
        <div className="floating-notices-heading"><p>O QUE ESTÁ EM CENA</p><button type="button" aria-label="Fechar lista de avisos" onClick={() => { setOpen(false); trigger.current?.focus(); }}><X size={18}/></button></div>
        <p className="floating-notices-title">Há sempre algo a acontecer.</p>
        <nav aria-label="Avisos disponíveis">{items.map((item, i) => <Link key={i} href={item.href} onClick={() => setOpen(false)}><span>{item.label}</span><ArrowUpRight size={18}/></Link>)}</nav>
      </div>}
      <button type="button" ref={trigger} className="ribbon-label" aria-expanded={open} aria-controls={open ? panelId : undefined} aria-label={compact ? "Abrir avisos Em cena" : "Ver todos os avisos"} onClick={() => { setCompact(false); setOpen(!open); }}>
        <span className="floating-notices-dot" aria-hidden="true"/> EM CENA <ChevronUp size={16} aria-hidden="true" />
      </button>
      <div className="ribbon-window" hidden={compact}>
        <div className="ribbon-track">
          {[0, 1].map((copy) => (
            <div
              className="ribbon-copy"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {items.map((item, i) => (
                <Link
                  href={item.href}
                  key={i}
                  tabIndex={copy === 1 ? -1 : undefined}
                >
                  <span aria-hidden="true">✳</span>
                  {item.label}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        hidden={compact}
        className="ribbon-pause"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? "Retomar avisos" : "Pausar avisos"}
        aria-pressed={paused}
      >
        {paused ? <Play size={17} /> : <Pause size={17} />}
      </button>
      {!compact && <button type="button" className="ribbon-minimise" aria-label="Recolher avisos" onClick={() => { setCompact(true); setOpen(false); trigger.current?.focus(); }}><Minus size={18}/></button>}
    </aside>
  );
}
