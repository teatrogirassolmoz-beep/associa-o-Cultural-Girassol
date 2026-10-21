"use client";
import Link from "next/link";
import { LivingBackdrop } from "@/components/ui/LivingBackdrop";
import { ManagedLogo } from "@/components/ui/ManagedLogo";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { ArrowDown, ArrowUpRight, Asterisk } from "lucide-react";
import { StageArtwork } from "@/components/ui/StageArtwork";
import { useSection, text } from "@/components/publicCms";
export function FitiHero() {
  const { settings } = useThemeSettings();
  const f = useSection("fiti_hero");
  return (
    <section id="fiti-inicio" className="festival-hero festival-hero-fiti">
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
          <span>UMA INICIATIVA DA ASSOCIAÇÃO GIRASSOL.</span>
          <span>O TEATRO MOÇAMBICANO ENCONTRA O MUNDO.</span>
        </div>
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span />
            {text(f.eyebrow, "Moçambique encontra o mundo")}
          </p>
          {settings.fiti_logo_url ? (
            <ManagedLogo
              settingKey="fiti_logo_url"
              alt="FITI"
              className="mb-6 h-28 w-auto object-contain"
              fallback={null}
            />
          ) : null}
          <p className="fiti-wordmark" aria-hidden="true">
            FI<span>TI</span>
            <i aria-hidden="true">
              <Asterisk />
            </i>
          </p>
          <h1>
            {text(f.title, "FITI – Festival Internacional Teatro de Inverno")}
          </h1>
          <p className="hero-subtitle">
            {text(
              f.subtitle,
              "Uma plataforma de teatro, intercâmbio, formação e circulação artística.",
            )}
          </p>
          <p className="hero-description">{text(f.description)}</p>
          <div className="hero-actions">
            <Link
              className="festival-button"
              href={text(
                f.primary_button_url || f.primary_button_link,
                "#programacao",
              )}
            >
              {text(
                f.primary_button_label || f.primary_button_text,
                "Ver programação",
              )}
              <ArrowUpRight size={20} />
            </Link>
            <Link
              className="festival-button festival-button-outline"
              href={text(
                f.secondary_button_url || f.secondary_button_link,
                "#formularios",
              )}
            >
              {text(
                f.secondary_button_label || f.secondary_button_text,
                "Candidaturas e inscrições",
              )}
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
        <StageArtwork fiti />
      </div>
      <div className="hero-bottom">
        <Link href="/">← Associação Girassol</Link>
        <Link href="#sobre">
          Descubra o festival <ArrowDown size={18} />
        </Link>
        <span>TEATRO SEM FRONTEIRAS</span>
      </div>
    </section>
  );
}
