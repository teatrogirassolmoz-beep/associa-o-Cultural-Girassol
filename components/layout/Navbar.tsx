"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GirassolLogo } from "@/components/ui/GirassolLogo";
import { FitiLogo } from "@/components/ui/FitiLogo";
import { ManagedLogo } from "@/components/ui/ManagedLogo";
import { AreaMenu } from "./AreaMenu";
import type { ThemeSettings } from "@/types/cms";
import { usePublicNavigation } from "@/hooks/usePublicNavigation";
export function Navbar({ settings }: { settings?: ThemeSettings }) {
  const router = useRouter();
  const pathname = usePathname();
  const fiti = pathname.replace(/\/$/, "").endsWith("/fiti");
  const { data: links } = usePublicNavigation("main_menu"),
    { data: fitiLinks } = usePublicNavigation("fiti_menu");
  const primaryDefaults = fiti
    ? [
        ["Programação", "/fiti#programacao"],
        ["Seminários", "/fiti?pesquisa=seminario#programacao"],
        ["Oficinas", "/fiti#oficinas"],
        ["Companhias", "/fiti#companhias"],
        ["O festival", "/fiti#sobre"],
        ["Parceiros", "/fiti#parceiros"],
      ]
    : [
        ["Associação", "/#quem-somos"],
        ["Projectos", "/#projectos"],
        ["Pessoas", "/#membros"],
        ["Galeria", "/#galeria"],
        ["FITI", "/fiti"],
      ];
  const normaliseHref = (href: string) =>
    (href.startsWith("#") ? `/${href}` : href).replace(/\/(?=#|$)/g, "");
  const stored = fiti ? fitiLinks : links;
  const primary = primaryDefaults.map(([label, href]) => {
    const entry = stored.find(
      (item) => normaliseHref(item.url) === normaliseHref(href),
    );
    return [entry?.label || label, href];
  });
  return (
    <header className="festival-nav">
      <div className="festival-nav-inner">
        <Link
          href={fiti ? "/fiti#fiti-inicio" : "/#inicio"}
          className="festival-brand"
          onDoubleClick={(event) => {
            event.preventDefault();
            router.push("/admin");
          }}
        >
          <ManagedLogo
            debugLabel="Navbar"
            settingKey={fiti ? "fiti_logo_url" : "site_logo_url"}
            alt={
              fiti
                ? settings?.fiti_logo_alt ||
                  "FITI – Festival Internacional Teatro de Inverno"
                : settings?.site_logo_alt || "Associação Cultural Girassol"
            }
            className="h-12 w-auto object-contain"
            fallback={fiti ? <FitiLogo compact /> : <GirassolLogo compact />}
          />
          <span>
            {fiti ? "FITI" : "GIRASSOL"}
            <small>
              {fiti ? "TEATRO EM MOÇAMBIQUE" : "ASSOCIAÇÃO CULTURAL"}
            </small>
          </span>
        </Link>
        <nav
          aria-label="Navegação principal"
          className="festival-primary-links"
        >
          {primary.map(([label, href]) =>
            href.includes("?pesquisa=") ? (
              <a href="?pesquisa=seminario#programacao" key={href}>
                {label}
              </a>
            ) : (
              <Link href={href} key={href}>
                {label}
              </Link>
            ),
          )}
        </nav>
        <Link href="/fiti#formularios" className="festival-nav-register">
          {fiti ? "Inscrições" : "Participar"}
        </Link>
        <AreaMenu
          links={[...links, ...fitiLinks].map((link) => ({
            label: link.label,
            href: link.url.startsWith("#") ? `/${link.url}` : link.url,
          }))}
        />
      </div>
    </header>
  );
}
