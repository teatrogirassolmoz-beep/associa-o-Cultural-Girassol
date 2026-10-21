"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GirassolLogo } from "@/components/ui/GirassolLogo";
import { FitiLogo } from "@/components/ui/FitiLogo";
import { ManagedLogo } from "@/components/ui/ManagedLogo";
import { usePresentation } from "@/components/ui/SitePresentation";
import { safePublicHref } from "@/lib/community";
import { AreaMenu } from "./AreaMenu";
import type { ThemeSettings } from "@/types/cms";
import { usePublicNavigation } from "@/hooks/usePublicNavigation";
export function Navbar({ settings }: { settings?: ThemeSettings }) {
  const router = useRouter();
  const pathname = usePathname();
  const fiti = pathname.replace(/\/$/, "").endsWith("/fiti");
  const { data: links } = usePublicNavigation("main_menu"),
    { data: fitiLinks } = usePublicNavigation("fiti_menu");
  const config = usePresentation();
  const stored = (fiti ? fitiLinks : links).filter(item=>safePublicHref(item.url));
  const highlighted = !fiti && config.fiti_menu_highlight === 'true' ? stored.find(item=>item.url.replace(/\/$/,'')==='/fiti') : undefined;
  const visible = highlighted ? [...stored.filter(item=>item!==highlighted).slice(0,5),highlighted] : stored.slice(0,6);
  const primary = visible.map(item=>[item.label,item.url.startsWith('#')?`${fiti?'/fiti':'/'}${item.url}`:item.url]);
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
            {fiti ? config.fiti_brand_label : config.home_brand_label}
            <small>
              {fiti ? config.fiti_brand_subtitle : config.home_brand_subtitle}
            </small>
          </span>
        </Link>
        {fiti && <Link href="/" className="festival-return">{config.association_return_label}</Link>}
        <nav
          aria-label="Navegação principal"
          className="festival-primary-links"
        >
          {primary.map(([label,href])=><Link href={href} key={href} className={href.replace(/\/$/,'')==='/fiti'&&config.fiti_menu_highlight==='true'?'nav-fiti-highlight':undefined} onClick={event=>{if(href.includes('?')){event.preventDefault();window.location.assign(event.currentTarget.href);}}}>{label}</Link>)}
        </nav>
        <Link href={safePublicHref(fiti ? config.fiti_nav_cta_link : config.home_nav_cta_link) || (fiti ? "/fiti#formularios" : "/fiti")} className="festival-nav-register">
          {fiti ? config.fiti_nav_cta : config.home_nav_cta}
        </Link>
        <AreaMenu />
      </div>
    </header>
  );
}
