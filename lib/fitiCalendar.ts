export type CalendarEvent = {
  id: string;
  kind: "program" | "workshop";
  title: string;
  date: string | null;
  time: string;
  minutes: number | null;
  category: string;
  artist: string;
  country: string;
  venue: string;
  description: string;
  image: string;
  action: string;
  duration: string;
  ageRating: string;
  vacancies: string;
  audience: string;
};
type Row = Record<string, unknown>;
const str = (value: unknown) =>
  typeof value === "string"
    ? value.trim()
    : typeof value === "number"
      ? String(value)
      : "";
export function safeEventLink(value: unknown): string {
  const url = str(value);
  if (!url || /[\u0000-\u001f\u007f\\]/.test(url)) return "";
  if (url.startsWith("#") || (url.startsWith("/") && !url.startsWith("//")))
    return url;
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}
export function parseDateKey(value: unknown): string | null {
  const key = str(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const date = new Date(`${key}T12:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === key
    ? key
    : null;
}
export function shiftDate(key: string, days: number): string {
  if (!parseDateKey(key)) throw new Error("Data inválida.");
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function shiftMonth(month: string, count: number): string {
  if (!parseDateKey(`${month}-01`)) throw new Error("Mês inválido.");
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + count);
  return date.toISOString().slice(0, 7);
}
export function monthGrid(month: string): (string | null)[][] {
  if (!parseDateKey(`${month}-01`)) return [];
  const start = new Date(`${month}-01T12:00:00Z`);
  const offset = (start.getUTCDay() + 6) % 7;
  const last = new Date(start);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  const cells: (string | null)[] = Array(offset).fill(null);
  for (let day = 1; day <= last.getUTCDate(); day++)
    cells.push(`${month}-${String(day).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );
}
export function formatFestivalDate(
  key: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  },
): string {
  return parseDateKey(key)
    ? new Intl.DateTimeFormat("pt-PT", { ...options, timeZone: "UTC" }).format(
        new Date(`${key}T12:00:00Z`),
      )
    : "Data por confirmar";
}
export function firstTime(value: string): number | null {
  const match = value.match(
    /(?:^|\s|às\s*)(\d{1,2})(?:(?::|h)(\d{2}))?\s*h?(?=$|\s|[–—-])/i,
  );
  if (!match) return null;
  const hours = Number(match[1]),
    minutes = Number(match[2] || 0);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}
export function normaliseSchedule(
  program: Row[],
  workshops: Row[],
  editionId: string | null | undefined,
): CalendarEvent[] {
  if (!editionId) return [];
  const seen = new Set<string>();
  const convert = (rows: Row[], kind: CalendarEvent["kind"]) =>
    rows.flatMap((row, index) => {
      if (
        str(row.edition_id) !== editionId ||
        row.is_active === false ||
        row.is_active === "false" ||
        row.is_active === 0 ||
        !str(row.title)
      )
        return [];
      const date = parseDateKey(row.date),
        time = str(row.time);
      const id = `${kind}-${str(row.id) || `${date || "pending"}-${time}-${str(row.title)}-${index}`}`;
      if (seen.has(id)) return [];
      seen.add(id);
      return [
        {
          id,
          kind,
          title: str(row.title),
          date,
          time,
          minutes: firstTime(time),
          category:
            kind === "workshop"
              ? "Oficinas"
              : str(row.category) || "Espectáculo",
          artist: str(kind === "workshop" ? row.trainer : row.company),
          country: str(row.country),
          venue: str(row.venue),
          description: str(
            kind === "workshop" ? row.description : row.synopsis,
          ),
          image: safeEventLink(row.image_url),
          action: safeEventLink(
            kind === "workshop" ? row.registration_link : row.reservation_link,
          ),
          duration: str(row.duration),
          ageRating: str(row.age_rating),
          vacancies: str(row.vacancies),
          audience: str(row.target_audience),
        },
      ];
    });
  return [
    ...convert(program, "program"),
    ...convert(workshops, "workshop"),
  ].sort(
    (a, b) =>
      (a.date || "9999").localeCompare(b.date || "9999") ||
      (a.minutes ?? 1440) - (b.minutes ?? 1440) ||
      a.title.localeCompare(b.title, "pt"),
  );
}
export function foldSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");
}
export function filterSchedule(
  events: CalendarEvent[],
  filters: { query?: string; category?: string; venue?: string },
): CalendarEvent[] {
  const needle = foldSearch((filters.query || "").trim());
  return events.filter(
    (event) =>
      (!filters.category || event.category === filters.category) &&
      (!filters.venue || event.venue === filters.venue) &&
      (!needle ||
        foldSearch(
          [
            event.title,
            event.artist,
            event.venue,
            event.category,
            event.country,
          ].join(" "),
        ).includes(needle)),
  );
}
function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
function foldIcsLine(line: string): string {
  let current = "",
    bytes = 0;
  const lines: string[] = [];
  const encoder = new TextEncoder();
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      lines.push(current);
      current = " ";
      bytes = 1;
    }
    current += char;
    bytes += size;
  }
  lines.push(current);
  return lines.join("\r\n");
}
export function eventIcs(
  event: CalendarEvent,
  now = new Date(),
): string | null {
  if (!event.date || !parseDateKey(event.date)) return null;
  const date = event.date.replace(/-/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Associacao Cultural Girassol//FITI//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  if (event.minutes !== null)
    lines.push(
      "BEGIN:VTIMEZONE",
      "TZID:Africa/Maputo",
      "BEGIN:STANDARD",
      "DTSTART:19700101T000000",
      "TZOFFSETFROM:+0200",
      "TZOFFSETTO:+0200",
      "TZNAME:CAT",
      "END:STANDARD",
      "END:VTIMEZONE",
    );
  lines.push(
    "BEGIN:VEVENT",
    `UID:${event.id.replace(/[^a-zA-Z0-9_.-]/g, "-")}@fiti.girassol`,
    `DTSTAMP:${now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z")}`,
    `SUMMARY:${escapeIcs(event.title)}`,
  );
  if (event.minutes !== null) {
    const time = (n: number) =>
      `${String(Math.floor(n / 60)).padStart(2, "0")}${String(n % 60).padStart(2, "0")}00`;
    lines.push(`DTSTART;TZID=Africa/Maputo:${date}T${time(event.minutes)}`);
    const duration = event.duration.match(
      /^(\d+)\s*(?:min|minutos|minutes)\.?$/i,
    );
    if (duration && Number(duration[1]) > 0 && Number(duration[1]) <= 1440) {
      const end = event.minutes + Number(duration[1]);
      const endDate = shiftDate(event.date, Math.floor(end / 1440)).replace(
        /-/g,
        "",
      );
      lines.push(`DTEND;TZID=Africa/Maputo:${endDate}T${time(end % 1440)}`);
    }
  } else
    lines.push(
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${shiftDate(event.date, 1).replace(/-/g, "")}`,
    );
  lines.push(
    `DESCRIPTION:${escapeIcs([event.artist, event.description, event.time ? `Horário: ${event.time}` : "Horário por confirmar", "Horários de Moçambique (UTC+2)."].filter(Boolean).join("\n"))}`,
  );
  if (event.venue) lines.push(`LOCATION:${escapeIcs(event.venue)}`);
  if (/^https?:\/\//.test(event.action)) lines.push(`URL:${event.action}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

export function categoryTone(category: string): string {
  const value = foldSearch(category);
  if (/oficin|formac|masterclass/.test(value)) return "workshop";
  if (/semin|debate|confer|encontro/.test(value)) return "talk";
  if (/danca/.test(value)) return "dance";
  if (/music/.test(value)) return "music";
  if (/cerimon|abertura/.test(value)) return "ceremony";
  return "theatre";
}
