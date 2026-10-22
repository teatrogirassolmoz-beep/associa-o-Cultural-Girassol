"use client";
import Link from "next/link";
import { ArrowUpRight, MapPin, Clock3 } from "lucide-react";
import { GirassolArtwork } from "@/components/art/GirassolArtwork";
import { categoryTone, type CalendarEvent } from "@/lib/fitiCalendar";
export function FestivalEvent({
  event,
  onOpen,
}: {
  event: CalendarEvent;
  onOpen: (event: CalendarEvent) => void;
}) {
  return (
    <article className={`festival-event festival-event-${event.kind}`}>
      <div className="festival-event-visual">
        {event.image ? (
          <img src={event.image} alt={event.title} loading="lazy" />
        ) : (
          <>
            <GirassolArtwork
              variant={event.kind === "workshop" ? 1 : 3}
              title={event.title}
            />
            <span>Ilustração</span>
          </>
        )}
      </div>
      <div className="festival-event-copy">
        <p
          className="festival-event-kicker"
          data-tone={categoryTone(event.category)}
        >
          <span>{event.category}</span>
          {event.country && <span>{event.country}</span>}
        </p>
        <h4>{event.title}</h4>
        {event.artist && (
          <p className="festival-event-artist">
            {event.kind === "workshop" ? "com " : ""}
            <strong>{event.artist}</strong>
          </p>
        )}
        <p className="festival-event-meta">
          <span>
            <Clock3 size={14} />
            {event.time || "Horário a confirmar"}
          </span>
          {event.venue && (
            <span>
              <MapPin size={14} />
              {event.venue}
            </span>
          )}
        </p>
        {(event.duration || event.ageRating) && (
          <p className="festival-event-extra">
            {[event.duration, event.ageRating].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="festival-event-links">
          <button type="button" onClick={() => onOpen(event)}>
            Sinopse e detalhes <ArrowUpRight size={15} />
          </button>
          {event.action && (
            <Link href={event.action}>
              {event.kind === "workshop" ? "Inscrição" : "Reservar"}{" "}
              <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
