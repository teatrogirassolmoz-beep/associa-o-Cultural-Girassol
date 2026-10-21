"use client";
import Link from "next/link";
import { LivingBackdrop } from "@/components/ui/LivingBackdrop";
import { ManagedLogo } from "@/components/ui/ManagedLogo";
import { GirassolLogo } from "@/components/ui/GirassolLogo";
import { FitiLogo } from "@/components/ui/FitiLogo";
import { ArrowDown, ArrowUpRight, Asterisk } from "lucide-react";
import { StageArtwork } from "@/components/ui/StageArtwork";
import { useSection, text } from "@/components/publicCms";
export function Hero() {
  const f = useSection("home_hero");
  const title = text(f.title, "Associação Cultural Girassol");
  const isDefaultTitle = title === "Associação Cultural Girassol";
  return (
    <section id="inicio" className="festival-hero">
      <LivingBackdrop />
      {typeof f.background_video_url === "string" && f.background_video_url && (
        <video
          className="hero-video"
          src={f.background_video_url}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      <div className="hero-layout">
        <div className="future-manifesto" aria-hidden="true">
          <span>MAPUTO. MOÇAMBIQUE.</span>
          <span>TEATRO, JUVENTUDE E MEMÓRIA DESDE 1987.</span>
        </div>
        <div className="hero-copy">
          <ManagedLogo settingKey="hero_logo_url" fallbackKeys={["site_logo_url"]} alt="Associação Cultural Girassol" className="hero-official-logo" fallback={<GirassolLogo />} />
          <p className="hero-eyebrow">
            <span />
            {text(f.eyebrow, "Teatro • juventude • memória")}
          </p>
          <h1
            className={
              isDefaultTitle
                ? "future-title future-title-brand"
                : "future-title"
            }
          >
            {isDefaultTitle ? (
              <>
                <span className="future-title-prefix">
                  Associação Cultural{" "}
                </span>
                <span className="future-title-name">
                  Giras<span>sol</span>
                  <i aria-hidden="true">
                    <Asterisk />
                  </i>
                </span>
              </>
            ) : (
              title
            )}
          </h1>
          <p className="hero-subtitle">
            {text(
              f.subtitle,
              "Teatro, juventude, memória e transformação cultural em Moçambique.",
            )}
          </p>
          <p className="hero-description">{text(f.description)}</p>
          <div className="hero-actions">
            <Link
              className="festival-button"
              href={text(
                f.primary_button_url || f.primary_button_link,
                "#quem-somos",
              )}
            >
              {text(
                f.primary_button_label || f.primary_button_text,
                "Conheça a Associação",
              )}
              <ArrowUpRight size={20} />
            </Link>
            <Link
              className="festival-button festival-button-outline home-fiti-entry"
              href={text(
                f.secondary_button_url || f.secondary_button_link,
                "/fiti",
              )}
            >
              <ManagedLogo settingKey="fiti_logo_url" alt="FITI" className="home-fiti-entry-logo" fallback={<FitiLogo compact />} />
              {text(
                f.secondary_button_label || f.secondary_button_text,
                "Entrar no FITI",
              )}
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
        <StageArtwork />
      </div>
      <div className="hero-bottom">
        <span className="future-index">TEATRO VIVO. CULTURA EM MOVIMENTO.</span>
        <Link href="#quem-somos">
          Conheça a nossa história <ArrowDown size={18} />
        </Link>
        <span>DESDE 1987</span>
      </div>
    </section>
  );
}
