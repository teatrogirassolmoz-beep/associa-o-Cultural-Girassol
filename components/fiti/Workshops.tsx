"use client";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useSection, text } from "@/components/publicCms";
import { formatFestivalDate } from "@/lib/fitiCalendar";
import { ArtPoster } from "@/components/art/ArtPoster";
import { useFitiSchedule } from "./FitiScheduleContext";
export function Workshops() {
  const fields = useSection("fiti_workshops");
  const { events, loading, error, refresh } = useFitiSchedule();
  const workshops = events.filter((event) => event.kind === "workshop");
  return (
    <section id="oficinas" className="fiti-workshops-section">
      <div className="festival-section-inner">
        <header className="festival-section-heading">
          <div>
            <p className="festival-eyebrow">
              APRENDER. EXPERIMENTAR. PARTILHAR.
            </p>
            <h2>{text(fields.section_title, "Oficinas")}</h2>
          </div>
          <p>
            {workshops.length
              ? `${workshops.length} ${workshops.length === 1 ? "oficina publicada" : "oficinas publicadas"}. `
              : ""}
            Formação e encontro para levar a criação mais longe.
          </p>
        </header>
        {error ? (
          <div className="schedule-notice">
            <p>Não foi possível carregar as oficinas.</p>
            <button type="button" onClick={() => void refresh()}>
              Tentar novamente
            </button>
          </div>
        ) : !workshops.length ? (
          <p className="workshop-empty">
            {loading
              ? "A carregar oficinas…"
              : "As oficinas, os formadores e as condições de participação serão anunciados em breve."}
          </p>
        ) : (
          <div className="festival-workshop-list">
            {workshops.map((event, i) => (
              <article className="festival-workshop" key={event.id}>
                <div className="workshop-date">
                  <strong>
                    {event.date
                      ? formatFestivalDate(event.date, {
                          day: "numeric",
                          month: "long",
                        })
                      : "Data por confirmar"}
                  </strong>
                  {event.date && (
                    <span>
                      {formatFestivalDate(event.date, { weekday: "long" })}
                    </span>
                  )}
                  <span>{event.time || "Horário a confirmar"}</span>
                </div>
                <div className="workshop-body">
                  <div className="workshop-portrait">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.artist || event.title}
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <ArtPoster variant={i + 1} title={event.title} />
                        <span>Ilustração</span>
                      </>
                    )}
                  </div>
                  <div className="workshop-copy">
                    <p className="workshop-category">
                      FORMAÇÃO{event.venue && ` · ${event.venue}`}
                    </p>
                    <h3>{event.title}</h3>
                    {event.artist && (
                      <p className="workshop-trainer">
                        com <strong>{event.artist}</strong>
                        {event.vacancies &&
                          ` · ${event.vacancies} vagas anunciadas`}
                      </p>
                    )}
                    <p>
                      {event.description ||
                        "Programa detalhado em actualização."}
                    </p>
                    {event.audience && (
                      <details>
                        <summary>
                          <ChevronDown size={17} />
                          Público-alvo e participação
                        </summary>
                        <p>{event.audience}</p>
                      </details>
                    )}
                  </div>
                  <div className="workshop-actions">
                    <Link
                      href={event.action || "#formularios"}
                      className="festival-register"
                    >
                      Informações e inscrição
                      <ArrowUpRight size={18} />
                    </Link>
                    <a
                      href={
                        event.date
                          ? `?dia=${event.date}#programacao`
                          : "#programacao"
                      }
                    >
                      Ver no calendário <ArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
