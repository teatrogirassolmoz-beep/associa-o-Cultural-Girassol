"use client";
import { ArrowUpRight } from "lucide-react";
import { whatWeDo } from "@/lib/data";
import { readList } from "@/lib/community";
import { useSection, text } from "@/components/publicCms";

export function WhatWeDo() {
  const f = useSection("home_what_we_do");
  const parsed = readList<{ title?: unknown; description?: unknown } | null>(
    f.cards,
    whatWeDo,
  ).filter(
    (row): row is { title: string; description: string } =>
      !!row &&
      typeof row.title === "string" &&
      typeof row.description === "string",
  );
  const items = parsed;
  return (
    <section id="o-que-fazemos" className="art-practices py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <header className="art-section-heading">
          <div>
            <p className="editorial-eyebrow">
              {text(f.eyebrow, "AS NOSSAS LINGUAGENS")}
            </p>
            <h2>{text(f.section_title, "O que fazemos")}</h2>
          </div>
          <p>
            O mesmo impulso.
            <br />
            <em>Muitas formas de expressão.</em>
          </p>
        </header>
        <div className="art-practice-list">
          {items.map((item, i) => (
            <details
              key={`${item.title}-${i}`}
              open={i === 0}
              className="art-practice"
            >
              <summary>
                <span className="art-practice-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{item.title}</h3>
                <span className="art-practice-symbol" aria-hidden="true">
                  {["✺", "↗", "⊙", "∿", "+", "◇"][i % 6]}
                </span>
                <ArrowUpRight size={24} />
              </summary>
              <div className="art-practice-body">
                <p>{item.description}</p>
                <span aria-hidden="true">GIRASSOL / ARTE EM ACÇÃO</span>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
