"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
const groups = [
  {
    title: "A Associação",
    links: [
      ["Quem somos", "/#quem-somos"],
      ["História e memória", "/#historia"],
      ["O que fazemos", "/#o-que-fazemos"],
      ["Projectos", "/#projectos"],
      ["Membros e equipa", "/#membros"],
      ["Impacto", "/#impacto"],
    ],
  },
  {
    title: "Universo FITI",
    links: [
      ["O festival", "/fiti#sobre"],
      ["Edição actual", "/fiti#edicao"],
      ["Programação", "/fiti#programacao"],
      ["Seminários", "/fiti?pesquisa=seminario#programacao"],
      ["Companhias", "/fiti#companhias"],
      ["Oficinas", "/fiti#oficinas"],
      ["Equipa FITI", "/fiti#membros"],
      ["Arquivo", "/fiti#arquivo"],
    ],
  },
  {
    title: "Faça parte",
    links: [
      ["Candidaturas e inscrições", "/fiti#formularios"],
      ["Bilhetes e reservas", "/fiti#bilhetes"],
      ["Notícias", "/#noticias"],
      ["Galeria", "/#galeria"],
      ["Parceiros", "/#parceiros"],
      ["Contactos", "/#contacto"],
    ],
  },
];
export function AreaMenu({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const onFiti = usePathname().replace(/\/$/, "").endsWith("/fiti");
  const knownDestinations = new Set(
    groups.flatMap((group) => group.links.map(([, href]) => href)),
  );
  const extraLinks = links.filter(
    (link, index) =>
      !knownDestinations.has(link.href) &&
      links.findIndex((other) => other.href === link.href) === index,
  );
  return (
    <>
      <button
        type="button"
        className="area-menu-trigger"
        aria-label="Menu"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
      >
        <span>Menu</span>
        <Menu size={21} />
      </button>
      <dialog
        ref={dialog}
        className="area-menu"
        aria-labelledby="area-menu-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="area-menu-top">
          <p>GIRASSOL × FITI</p>
          <button
            type="button"
            className="dialog-close"
            aria-label="Fechar menu"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <h2 id="area-menu-title">
          Há muito para <em>descobrir.</em>
        </h2>
        <nav aria-label="Todas as áreas" className="area-menu-grid">
          {groups.map((group, i) => (
            <div key={group.title}>
              <p className="area-group-number">0{i + 1}</p>
              <h3>{group.title}</h3>
              {group.links.map(([label, href]) =>
                href.includes("?pesquisa=") ? (
                  <a
                    key={href}
                    href={
                      onFiti
                        ? "?pesquisa=seminario#programacao"
                        : "./fiti/?pesquisa=seminario#programacao"
                    }
                    onClick={() => dialog.current?.close()}
                  >
                    {label}
                    <ArrowUpRight size={16} />
                  </a>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => dialog.current?.close()}
                  >
                    {label}
                    <ArrowUpRight size={16} />
                  </Link>
                ),
              )}
            </div>
          ))}
        </nav>
        {extraLinks.length > 0 && (
          <div className="area-menu-extra">
            <p>Outros atalhos</p>
            {extraLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                onClick={() => dialog.current?.close()}
              >
                {link.label} ↗
              </Link>
            ))}
          </div>
        )}
        <p className="area-menu-signature">
          Teatro. Juventude. Memória. Movimento.
        </p>
      </dialog>
    </>
  );
}
