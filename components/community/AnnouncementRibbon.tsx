"use client";
import Link from "next/link";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { useState } from "react";
import { announcements } from "@/lib/community";
import { useThemeSettings } from "@/hooks/useThemeSettings";
export function AnnouncementRibbon() {
  const { settings } = useThemeSettings();
  const items = announcements(settings.announcement_items);
  const [paused, setPaused] = useState(false);
  if (!items.length) return null;
  return (
    <aside
      className={`announcement-ribbon ${paused ? "is-paused" : ""}`}
      aria-label="Avisos e oportunidades"
    >
      <span className="ribbon-label">
        EM CENA <ArrowUpRight size={16} aria-hidden="true" />
      </span>
      <div className="ribbon-window">
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
        className="ribbon-pause"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? "Retomar avisos" : "Pausar avisos"}
        aria-pressed={paused}
      >
        {paused ? <Play size={17} /> : <Pause size={17} />}
      </button>
    </aside>
  );
}
