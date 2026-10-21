"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { GirassolLogo } from "@/components/ui/GirassolLogo";
import { ManagedLogo } from "@/components/ui/ManagedLogo";
import { AreaMenu } from "./AreaMenu";
import type { ThemeSettings } from "@/types/cms";
import { usePublicNavigation } from "@/hooks/usePublicNavigation";
export function Navbar({ settings }: { settings?: ThemeSettings }) {
  const router = useRouter();
  const { data: links } = usePublicNavigation("main_menu");
  const { data: fitiLinks } = usePublicNavigation("fiti_menu");
  return (
    <header className="festival-nav">
      <div className="festival-nav-inner">
        <Link
          href="/#inicio"
          onDoubleClick={(event) => {
            event.preventDefault();
            router.push("/admin");
          }}
          className="festival-brand"
        >
          <ManagedLogo
            debugLabel="Navbar"
            settingKey="site_logo_url"
            alt={settings?.site_logo_alt || "Associação Cultural Girassol"}
            className="h-12 w-auto object-contain"
            fallback={<GirassolLogo compact />}
          />
          <span>
            GIRASSOL<small>ASSOCIAÇÃO CULTURAL</small>
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="festival-nav-links">
          <Link href="/#quem-somos">Associação</Link>
          <Link href="/#membros">Pessoas</Link>
          <Link href="/fiti#formularios">
            Participar <ArrowUpRight size={14} />
          </Link>
          <Link href="/fiti" className="nav-fiti">
            FITI <ArrowUpRight size={14} />
          </Link>
        </nav>
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
