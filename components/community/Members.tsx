"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Users, X } from "lucide-react";
import { memberProfiles, type MemberProfile } from "@/lib/community";
import { useThemeSettings } from "@/hooks/useThemeSettings";
export function Members({ fiti = false }: { fiti?: boolean }) {
  const { settings } = useThemeSettings();
  const profiles = memberProfiles(settings.member_profiles);
  const [filter, setFilter] = useState(fiti ? "fiti" : "todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MemberProfile | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const normalise = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const visible = profiles.filter(
    (p) =>
      (filter === "todos" || p.group === filter) &&
      normalise(`${p.name} ${p.role}`).includes(normalise(query)),
  );
  function openProfile(profile: MemberProfile) {
    setSelected(profile);
    dialog.current?.showModal();
  }
  return (
    <section id="membros" className="members-section">
      <div className="mx-auto max-w-7xl px-4">
        <div className="members-heading">
          <div>
            <p className="editorial-eyebrow">O NOSSO COLECTIVO</p>
            <h2>
              O palco começa
              <br />
              nas <em>pessoas.</em>
            </h2>
          </div>
          <p>
            As vozes, os rostos e as histórias de quem constrói a Associação
            Cultural Girassol e dá vida ao FITI.
          </p>
        </div>
        <div className="members-toolbar">
          <div
            className="member-filters"
            role="group"
            aria-label="Filtrar membros"
          >
            {[
              ["todos", "Todos"],
              ["associacao", "Associação"],
              ["fiti", "FITI"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="members-search">
            <Search size={18} />
            <span className="sr-only">Pesquisar membros</span>
            <input
              type="search"
              placeholder="Procurar uma pessoa…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        {visible.length ? (
          <div className="members-grid">
            {visible.map((p, i) => (
              <button
                type="button"
                className="member-card"
                key={`${p.group}-${p.name}-${i}`}
                onClick={() => openProfile(p)}
                aria-label={`Conhecer ${p.name}`}
              >
                <div className="member-portrait">
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <span className="member-initials" aria-hidden="true">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span className="member-group">
                    {p.group === "fiti" ? "FITI" : "GIRASSOL"}
                  </span>
                </div>
                <div className="member-card-copy">
                  <h3>{p.name}</h3>
                  <p>{p.role}</p>
                  <span>
                    Conhecer percurso <ArrowUpRight size={18} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="members-empty">
            <div className="members-empty-art" aria-hidden="true">
              <Users size={64} />
              <span>
                JUNTOS,
                <br />
                FAZEMOS
                <br />
                <b>ACONTECER.</b>
              </span>
            </div>
            <div>
              <h3>
                {profiles.length
                  ? "Nenhum perfil encontrado"
                  : "Uma comunidade em cena"}
              </h3>
              <p>
                {profiles.length
                  ? "Experimente outro nome ou escolha uma das áreas."
                  : "Os perfis dos membros da Associação e da equipa FITI estão em preparação. Em breve, conheça os seus rostos e percursos."}
              </p>
              <Link href="#contacto">
                Fale com a organização <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>
      <dialog
        ref={dialog}
        className="profile-dialog"
        aria-label={
          selected ? `Perfil de ${selected.name}` : "Perfil de membro"
        }
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="dialog-close"
          type="button"
          aria-label="Fechar perfil"
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>
        {selected && (
          <article>
            <p className="editorial-eyebrow">
              {selected.group === "fiti"
                ? "EQUIPA FITI"
                : "ASSOCIAÇÃO GIRASSOL"}
            </p>
            <h2>{selected.name}</h2>
            <p className="profile-role">{selected.role}</p>
            <p className="profile-bio">
              {selected.bio || "Biografia em actualização."}
            </p>
          </article>
        )}
      </dialog>
    </section>
  );
}
