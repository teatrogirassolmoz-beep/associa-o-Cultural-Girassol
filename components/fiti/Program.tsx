"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  X,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { useSection, text } from "@/components/publicCms";
import { useFitiSchedule } from "./FitiScheduleContext";
import { FestivalEvent } from "./FestivalEvent";
import {
  eventIcs,
  categoryTone,
  filterSchedule,
  formatFestivalDate,
  monthGrid,
  parseDateKey,
  shiftDate,
  shiftMonth,
  type CalendarEvent,
} from "@/lib/fitiCalendar";

const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function todayInMaputo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Maputo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function Program() {
  const fields = useSection("fiti_program");
  const { events, edition, loading, error, refresh } = useFitiSchedule();
  const [today, setToday] = useState<string | null>(null),
    [monthChoice, setMonthChoice] = useState<string | null>(null),
    [dayChoice, setDayChoice] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "agenda">("calendar");
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [venue, setVenue] = useState("");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    dayButtons = useRef<Record<string, HTMLButtonElement | null>>({}),
    focusDate = useRef<string | null>(null);
  useEffect(() => {
    setToday(todayInMaputo());
    const search = new URLSearchParams(location.search).get("pesquisa");
    if (search) setQuery(search.slice(0, 200));
    const requested = parseDateKey(
      new URLSearchParams(location.search).get("dia"),
    );
    if (requested) {
      setMonthChoice(requested.slice(0, 7));
      setDayChoice(requested);
    }
  }, []);
  const firstDate = events.find((event) => event.date)?.date;
  const categories = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.category))).sort((a, b) =>
        a.localeCompare(b, "pt"),
      ),
    [events],
  );
  const venues = useMemo(
    () =>
      Array.from(
        new Set(events.map((event) => event.venue).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "pt")),
    [events],
  );
  const filtered = useMemo(
    () => filterSchedule(events, { query, category, venue }),
    [events, query, category, venue],
  );
  const preferredDate =
    query || category || venue
      ? filtered.find((event) => event.date)?.date
      : firstDate;
  const month =
    monthChoice ?? firstDate?.slice(0, 7) ?? today?.slice(0, 7) ?? null;
  const dated = filtered.filter(
    (event) => event.date && event.date.startsWith(month ?? "!"),
  );
  const pending = filtered.filter((event) => !event.date);
  const dates = Array.from(new Set(dated.map((event) => event.date!)));
  const activeDay = dayChoice?.startsWith(month ?? "!")
    ? dayChoice
    : (dates[0] ?? (month ? `${month}-01` : null));
  const dayEvents = dated.filter((event) => event.date === activeDay);
  const agendaDates = dayChoice?.startsWith(month ?? "!") ? [dayChoice] : dates;
  const hasFilters = Boolean(query || category || venue);
  useEffect(() => {
    if (focusDate.current) {
      dayButtons.current[focusDate.current]?.focus();
      focusDate.current = null;
    }
  }, [dayChoice, month]);
  function changeMonth(delta: number) {
    if (month) {
      setMonthChoice(shiftMonth(month, delta));
      setDayChoice(null);
    }
  }
  function clearFilters() {
    setQuery("");
    setCategory("");
    setVenue("");
    setDayChoice(null);
  }
  function selectDay(key: string) {
    setDayChoice(key);
  }
  function onDayKey(event: KeyboardEvent<HTMLButtonElement>, key: string) {
    let target: string | null = null;
    const weekday = (new Date(`${key}T12:00:00Z`).getUTCDay() + 6) % 7;
    if (event.key === "ArrowLeft") target = shiftDate(key, -1);
    if (event.key === "ArrowRight") target = shiftDate(key, 1);
    if (event.key === "ArrowUp") target = shiftDate(key, -7);
    if (event.key === "ArrowDown") target = shiftDate(key, 7);
    if (event.key === "Home") target = shiftDate(key, -weekday);
    if (event.key === "End") target = shiftDate(key, 6 - weekday);
    if (event.key === "PageUp")
      target = `${shiftMonth(key.slice(0, 7), -1)}-01`;
    if (event.key === "PageDown")
      target = `${shiftMonth(key.slice(0, 7), 1)}-01`;
    if (target) {
      event.preventDefault();
      focusDate.current = target;
      setMonthChoice(target.slice(0, 7));
      setDayChoice(target);
    }
  }
  function openEvent(event: CalendarEvent) {
    setSelected(event);
    dialog.current?.showModal();
  }
  function download(event: CalendarEvent) {
    const contents = eventIcs(event);
    if (!contents) return;
    const url = URL.createObjectURL(
      new Blob([contents], { type: "text/calendar;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `fiti-${event.date}.ics`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section
      id="programacao"
      className="fiti-program-section"
      aria-busy={loading}
    >
      <div className="festival-section-inner">
        <header className="festival-section-heading">
          <div>
            <p className="festival-eyebrow">
              {text(fields.eyebrow, "O FITI, DIA A DIA")}
            </p>
            <h2>{text(fields.section_title, "Programação FITI")}</h2>
          </div>
          <div className="festival-edition-label">
            <span>
              {edition?.year
                ? `EDIÇÃO ${edition.year}`
                : "EDIÇÃO EM PREPARAÇÃO"}
            </span>
            <p>
              {text(
                fields.section_subtitle,
                "Escolha um dia. Descubra o que entra em cena.",
              )}
            </p>
          </div>
        </header>
        <div className="schedule-filters">
          <label className="schedule-search">
            <Search size={18} />
            <span className="sr-only">Pesquisar programação</span>
            <input
              type="search"
              placeholder="Espectáculo, artista ou companhia…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDayChoice(null);
              }}
            />
          </label>

          <label>
            <span>Local</span>
            <select
              aria-label="Local"
              value={venue}
              onChange={(e) => {
                setVenue(e.target.value);
                setDayChoice(null);
              }}
            >
              <option value="">Todos os locais</option>
              {venues.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          {hasFilters && (
            <button
              type="button"
              className="schedule-clear"
              onClick={clearFilters}
            >
              <RotateCcw size={15} />
              Limpar filtros
            </button>
          )}
        </div>
        <div
          className="festival-category-filters"
          role="group"
          aria-label="Filtrar por actividade"
        >
          <button
            type="button"
            aria-pressed={!category}
            onClick={() => {
              setCategory("");
              setDayChoice(null);
            }}
          >
            Todas{" "}
            <small>{filterSchedule(events, { query, venue }).length}</small>
          </button>
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              data-tone={categoryTone(value)}
              aria-pressed={category === value}
              onClick={() => {
                setCategory(value);
                setDayChoice(null);
              }}
            >
              {value}
              <small>
                {
                  filterSchedule(events, { query, venue, category: value })
                    .length
                }
              </small>
            </button>
          ))}
        </div>
        {error ? (
          <div className="schedule-notice" role="alert">
            <h3>Não foi possível carregar a programação.</h3>
            <p>Tente novamente dentro de instantes.</p>
            <button type="button" onClick={() => void refresh()}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <div className="schedule-toolbar">
              <div className="schedule-month-nav">
                <button
                  type="button"
                  aria-label="Mês anterior"
                  onClick={() => changeMonth(-1)}
                  disabled={!month}
                >
                  <ChevronLeft size={21} />
                </button>
                <h3 aria-live="polite">
                  {month
                    ? formatFestivalDate(`${month}-01`, {
                        month: "long",
                        year: "numeric",
                      })
                    : "A preparar calendário…"}
                </h3>
                <button
                  type="button"
                  aria-label="Mês seguinte"
                  onClick={() => changeMonth(1)}
                  disabled={!month}
                >
                  <ChevronRight size={21} />
                </button>
              </div>
              <div
                className="schedule-view-toggle"
                role="group"
                aria-label="Vista da programação"
              >
                <button
                  type="button"
                  aria-pressed={view === "calendar"}
                  onClick={() => setView("calendar")}
                >
                  <CalendarDays size={16} />
                  Calendário
                </button>
                <button
                  type="button"
                  aria-pressed={view === "agenda"}
                  onClick={() => setView("agenda")}
                >
                  <List size={16} />
                  Agenda
                </button>
              </div>
            </div>
            <div className="schedule-meta">
              <p aria-live="polite">
                {loading
                  ? "A carregar programação…"
                  : `${dated.length} ${dated.length === 1 ? "actividade" : "actividades"} neste mês`}
              </p>
              <span>Horários de Moçambique · UTC+2</span>
              <button
                type="button"
                onClick={() => {
                  const target = firstDate?.slice(0, 7) ?? today?.slice(0, 7);
                  if (target) setMonthChoice(target);
                  setDayChoice(null);
                }}
              >
                Ir para a edição
              </button>
            </div>
            {dates.length > 0 && (
              <nav
                className="festival-days-strip"
                aria-label="Dias com programação"
              >
                <button
                  type="button"
                  aria-pressed={view === "agenda" && !dayChoice}
                  onClick={() => {
                    setDayChoice(null);
                    setView("agenda");
                  }}
                >
                  Todos os dias
                </button>
                {dates.map((key) => (
                  <button
                    type="button"
                    key={key}
                    aria-pressed={
                      activeDay === key &&
                      (view === "calendar" || Boolean(dayChoice))
                    }
                    onClick={() => selectDay(key)}
                  >
                    <strong>{Number(key.slice(-2))}</strong>
                    <span>
                      {formatFestivalDate(key, { weekday: "short" }).replace(
                        ".",
                        "",
                      )}
                    </span>
                  </button>
                ))}
              </nav>
            )}
            {view === "calendar" && month ? (
              <div className="festival-calendar-layout">
                <div className="festival-calendar">
                  <table>
                    <caption className="sr-only">
                      Calendário de{" "}
                      {formatFestivalDate(`${month}-01`, {
                        month: "long",
                        year: "numeric",
                      })}
                      . Use as setas para mudar de dia.
                    </caption>
                    <thead>
                      <tr>
                        {weekdays.map((day, i) => (
                          <th scope="col" key={day}>
                            <abbr
                              title={
                                [
                                  "Segunda-feira",
                                  "Terça-feira",
                                  "Quarta-feira",
                                  "Quinta-feira",
                                  "Sexta-feira",
                                  "Sábado",
                                  "Domingo",
                                ][i]
                              }
                            >
                              {day}
                            </abbr>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthGrid(month).map((week, i) => (
                        <tr key={i}>
                          {week.map((key, j) => {
                            const count = key
                              ? dated.filter((event) => event.date === key)
                                  .length
                              : 0;
                            return (
                              <td key={key ?? `empty-${j}`}>
                                {key && (
                                  <button
                                    type="button"
                                    ref={(node) => {
                                      dayButtons.current[key] = node;
                                    }}
                                    onKeyDown={(event) => onDayKey(event, key)}
                                    tabIndex={activeDay === key ? 0 : -1}
                                    aria-pressed={activeDay === key}
                                    aria-current={
                                      today === key ? "date" : undefined
                                    }
                                    aria-label={`${formatFestivalDate(key, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${count} ${count === 1 ? "actividade" : "actividades"}`}
                                    data-has-events={count > 0}
                                    onClick={() => selectDay(key)}
                                  >
                                    <span>{Number(key.slice(-2))}</span>
                                    {count > 0 && (
                                      <small>
                                        <i />
                                        {count}
                                      </small>
                                    )}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="calendar-legend">
                    <i />
                    Dias com actividades
                    <span>Seleccione uma data para ver o programa</span>
                  </p>
                </div>
                <div className="festival-day-agenda">
                  <header>
                    <span>{activeDay ? Number(activeDay.slice(-2)) : "—"}</span>
                    <div>
                      <p>EM CENA</p>
                      <h3>
                        {activeDay
                          ? formatFestivalDate(activeDay, {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })
                          : "Escolha um dia"}
                      </h3>
                    </div>
                  </header>
                  {dayEvents.length ? (
                    dayEvents.map((event) => (
                      <FestivalEvent
                        key={event.id}
                        event={event}
                        onOpen={openEvent}
                      />
                    ))
                  ) : (
                    <div className="schedule-day-empty">
                      <h4>
                        {events.length
                          ? "Um intervalo no palco."
                          : "A programação está a chegar."}
                      </h4>
                      <p>
                        {loading
                          ? "A carregar…"
                          : hasFilters
                            ? "Não há actividades neste dia com os filtros escolhidos."
                            : events.length
                              ? "Não há actividades publicadas para este dia. Escolha outra data."
                              : text(
                                  fields.empty_state_text,
                                  "As datas e actividades serão publicadas aqui assim que forem confirmadas.",
                                )}
                      </p>
                      {hasFilters && (
                        <button type="button" onClick={clearFilters}>
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="festival-agenda-list">
                {agendaDates.length && dated.length ? (
                  agendaDates.map((key) => (
                    <section className="festival-agenda-day" key={key}>
                      <header>
                        <strong>{Number(key.slice(-2))}</strong>
                        <span>
                          {formatFestivalDate(key, { weekday: "long" })}
                        </span>
                      </header>
                      <div>
                        {dated
                          .filter((event) => event.date === key)
                          .map((event) => (
                            <FestivalEvent
                              key={event.id}
                              event={event}
                              onOpen={openEvent}
                            />
                          ))}
                      </div>
                    </section>
                  ))
                ) : (
                  <div className="schedule-notice">
                    <h3>
                      {loading
                        ? "A carregar…"
                        : events.length
                          ? "Sem actividades neste mês."
                          : "Programação em preparação."}
                    </h3>
                    <p>
                      {hasFilters
                        ? "Experimente outros filtros ou outro mês."
                        : text(
                            fields.empty_state_text,
                            "As datas e actividades serão anunciadas em breve.",
                          )}
                    </p>
                  </div>
                )}
              </div>
            )}
            {pending.length > 0 && (
              <div className="schedule-pending">
                <h3>Datas por confirmar</h3>
                <p>Estas actividades ainda não têm uma data publicada.</p>
                {pending.map((event) => (
                  <FestivalEvent
                    key={event.id}
                    event={event}
                    onOpen={openEvent}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <dialog
        ref={dialog}
        className="festival-event-dialog"
        aria-labelledby="festival-event-title"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button
          type="button"
          aria-label="Fechar actividade"
          className="dialog-close"
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>
        <h3 id="festival-event-title">
          {selected?.title || "Detalhes da actividade"}
        </h3>
        {selected && (
          <>
            <p className="event-dialog-category">
              {selected.category}
              {selected.artist && ` · ${selected.artist}`}
            </p>
            <dl>
              <div>
                <dt>Quando</dt>
                <dd>
                  {selected.date
                    ? formatFestivalDate(selected.date)
                    : "Data por confirmar"}
                  <br />
                  {selected.time || "Horário a confirmar"}
                </dd>
              </div>
              {selected.venue && (
                <div>
                  <dt>Onde</dt>
                  <dd>{selected.venue}</dd>
                </div>
              )}
              {selected.duration && (
                <div>
                  <dt>Duração</dt>
                  <dd>{selected.duration}</dd>
                </div>
              )}
              {selected.ageRating && (
                <div>
                  <dt>Classificação</dt>
                  <dd>{selected.ageRating}</dd>
                </div>
              )}
              {selected.vacancies && (
                <div>
                  <dt>Vagas anunciadas</dt>
                  <dd>{selected.vacancies}</dd>
                </div>
              )}
              {selected.audience && (
                <div>
                  <dt>Público-alvo</dt>
                  <dd>{selected.audience}</dd>
                </div>
              )}
            </dl>
            <p className="event-dialog-synopsis">
              {selected.description ||
                "Informações detalhadas em actualização."}
            </p>
            <p className="event-dialog-timezone">
              Horários de Moçambique (UTC+2). Confirme eventuais alterações
              junto da organização.
            </p>
            <div className="event-dialog-actions">
              <Link
                href={
                  selected.action ||
                  (selected.kind === "workshop" ? "#formularios" : "#bilhetes")
                }
                onClick={() => dialog.current?.close()}
                className="festival-register"
              >
                {selected.kind === "workshop"
                  ? "Informações e inscrição"
                  : "Informações e reservas"}
                <ArrowUpRight size={18} />
              </Link>
              {selected.date && (
                <button type="button" onClick={() => download(selected)}>
                  <Download size={17} />
                  Adicionar à minha agenda (.ics)
                </button>
              )}
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
