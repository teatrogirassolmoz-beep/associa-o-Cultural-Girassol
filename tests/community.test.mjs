import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(
  new URL("../lib/community.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const {
  announcements,
  defaultAnnouncements,
  memberProfiles,
  readList,
  safePublicHref,
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("new installations have useful notices; an explicit empty list hides the ribbon", () => {
  assert.deepEqual(announcements(undefined), defaultAnnouncements);
  assert.deepEqual(announcements("[]"), []);
  assert.deepEqual(announcements("{bad json"), defaultAnnouncements);
});
test("public links reject scripts, protocol-relative URLs and URL-normalisation escapes", () => {
  for (const href of [
    "javascript:alert(1)",
    "//evil.example",
    "/\\evil.example",
    "/\n/evil.example",
    "data:text/html,hello",
  ])
    assert.equal(safePublicHref(href), "");
  for (const href of [
    "/#membros",
    "/fiti#formularios",
    "#contacto",
    "https://example.org/programa",
  ])
    assert.equal(safePublicHref(href), href);
});
test("only usable notices reach the public ribbon", () => {
  assert.deepEqual(
    announcements(
      JSON.stringify([
        null,
        {},
        { label: "", href: "/fiti" },
        { label: "Unsafe", href: "javascript:alert(1)" },
        { label: " Candidaturas ", href: "/fiti#formularios" },
      ]),
    ),
    [{ label: "Candidaturas", href: "/fiti#formularios" }],
  );
});
test("members retain biographies and groups and tolerate missing photos", () => {
  const members = memberProfiles(
    JSON.stringify([
      null,
      {},
      {
        name: " Pessoa de teste ",
        role: "Produção",
        group: "fiti",
        bio: "Primeiro parágrafo.\nSegundo parágrafo.",
        photo: "https://example.org/photo.jpg",
      },
      { name: "Outra pessoa", photo: "javascript:alert(1)" },
    ]),
  );
  assert.equal(members.length, 2);
  assert.equal(members[0].name, "Pessoa de teste");
  assert.equal(members[0].group, "fiti");
  assert.match(members[0].bio, /\n/);
  assert.equal(members[1].photo, "");
  assert.equal(members[1].group, "associacao");
  assert.deepEqual(memberProfiles("broken"), []);
});
test("non-list data cannot crash public sections", () => {
  for (const value of [null, {}, "null", "123", '"text"'])
    assert.deepEqual(readList(value), []);
});
