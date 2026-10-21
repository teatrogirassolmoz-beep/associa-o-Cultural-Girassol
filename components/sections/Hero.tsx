"use client";
import Link from "next/link";
import { LivingBackdrop } from "@/components/ui/LivingBackdrop";
import { ManagedLogo } from "@/components/ui/ManagedLogo";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { StageArtwork } from "@/components/ui/StageArtwork";
import { useSection, text } from "@/components/publicCms";
export function Hero() {
  const { settings } = useThemeSettings();
  const f = useSection("home_hero");
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
        <div className="hero-copy">
          {settings.hero_logo_url ? (
            <ManagedLogo
              settingKey="hero_logo_url"
              alt="Associação Cultural Girassol"
              className="mb-6 h-20 w-auto object-contain"
              fallback={null}
            />
          ) : null}
          <p className="hero-eyebrow">
            <span />
            {text(f.eyebrow, "Teatro • juventude • memória")}
          </p>
          <h1>{text(f.title, "Associação Cultural Girassol")}</h1>
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
              className="festival-button festival-button-outline"
              href={text(
                f.secondary_button_url || f.secondary_button_link,
                "/fiti",
              )}
            >
              {text(
                f.secondary_button_label || f.secondary_button_text,
                "Ver FITI",
              )}
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
        <StageArtwork />
      </div>
      <div className="hero-bottom">
        <span>ARTE QUE CRIA PONTES.</span>
        <Link href="#quem-somos">
          Entre no nosso universo <ArrowDown size={18} />
        </Link>
        <span>DESDE 1987</span>
      </div>
    </section>
  );
}
