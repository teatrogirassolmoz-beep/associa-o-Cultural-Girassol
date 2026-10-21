import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(
  new URL("../lib/fitiCalendar.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const {
  parseDateKey,
  shiftDate,
  shiftMonth,
  monthGrid,
  firstTime,
  normaliseSchedule,
  filterSchedule,
  eventIcs,
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const row = (id, date, extra = {}) => ({
  id,
  edition_id: "current",
  title: "Peça de teste",
  date,
  time: "20h",
  category: "Teatro",
  is_active: true,
  ...extra,
});
test("dates are strict and preserve festival dates without timezone shifts", () => {
  assert.equal(parseDateKey("2028-02-29"), "2028-02-29");
  for (const value of [
    "2026-02-29",
    "2026-02-31",
    "21/09/2026",
    "Datas a anunciar",
    "2026-09-21T00:00:00Z",
  ])
    assert.equal(parseDateKey(value), null);
  assert.equal(shiftDate("2026-12-31", 1), "2027-01-01");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
});
test("month grid starts on Monday, includes every valid day and leap days", () => {
  const september = monthGrid("2026-09");
  assert.equal(september[0][0], null);
  assert.equal(september[0][1], "2026-09-01");
  assert.equal(september.flat().filter(Boolean).length, 30);
  assert.equal(monthGrid("2028-02").flat().filter(Boolean).length, 29);
  assert.deepEqual(monthGrid("not-month"), []);
});
test("common Portuguese time formats sort chronologically", () => {
  for (const value of ["14:30", "14h30", "às 14h30"])
    assert.equal(firstTime(value), 870);
  for (const value of ["14h", "14h às 17h"])
    assert.equal(firstTime(value), 840);
  assert.equal(firstTime("0:00"), 0);
  for (const value of ["Horário a anunciar", "24:00", "14:75"])
    assert.equal(firstTime(value), null);
});
test("calendar only includes active edition records and retains repeat performances", () => {
  const result = normaliseSchedule(
    [
      row("a", "2026-09-21"),
      row("b", "2026-09-22"),
      row("old", "2026-09-23", { edition_id: "old" }),
      row("hidden", "2026-09-24", { is_active: false }),
      row("pending", null),
      row("a", "2026-09-21"),
    ],
    [
      row("w", "2026-09-21", {
        title: "Oficina",
        trainer: "Formador de teste",
        time: "10h",
      }),
    ],
    "current",
  );
  assert.equal(result.length, 4);
  assert.equal(result[0].kind, "workshop");
  assert.equal(result[0].artist, "Formador de teste");
  assert.equal(result.filter((e) => e.title === "Peça de teste").length, 3);
  assert.equal(result.at(-1).date, null);
  assert.deepEqual(normaliseSchedule([row("a", "2026-09-21")], [], null), []);
});
test("search, category and venue combine and ignore accents", () => {
  const events = normaliseSchedule(
    [
      row("a", "2026-09-21", {
        title: "Criação e memória",
        venue: "Sala Girassol",
      }),
      row("b", "2026-09-22", { category: "Seminário", venue: "Outro palco" }),
    ],
    [],
    "current",
  );
  assert.equal(
    filterSchedule(events, {
      query: "criacao",
      venue: "Sala Girassol",
      category: "Teatro",
    }).length,
    1,
  );
  assert.equal(
    filterSchedule(events, { query: "criacao", venue: "Outro palco" }).length,
    0,
  );
});
test("ICS uses Maputo timezone, escapes text, respects duration crossing midnight and folds UTF-8 lines", () => {
  const event = normaliseSchedule(
    [
      row("a", "2026-12-31", {
        time: "23h30",
        duration: "90 min",
        synopsis: "Árvore, palco; voz\n" + "Memória ".repeat(30),
      }),
    ],
    [],
    "current",
  )[0];
  const ics = eventIcs(event, new Date("2026-01-01T10:00:00Z"));
  assert.match(ics, /DTSTART;TZID=Africa\/Maputo:20261231T233000/);
  assert.match(ics, /DTEND;TZID=Africa\/Maputo:20270101T010000/);
  const unfolded = ics.replace(/\r\n /g, "");
  assert.match(unfolded, /Árvore\\, palco\\; voz\\n/);
  for (const line of ics.split("\r\n"))
    assert(Buffer.byteLength(line, "utf8") <= 75);
  assert.match(ics, /DTSTAMP:20260101T100000Z/);
});
test("unknown times export a date only; unconfirmed dates cannot be exported", () => {
  const event = normaliseSchedule(
    [row("a", "2026-09-21", { time: "A confirmar" }), row("b", null)],
    [],
    "current",
  );
  assert.match(eventIcs(event[0]), /DTSTART;VALUE=DATE:20260921/);
  assert.doesNotMatch(eventIcs(event[0]), /T200000/);
  assert.equal(eventIcs(event[1]), null);
});
