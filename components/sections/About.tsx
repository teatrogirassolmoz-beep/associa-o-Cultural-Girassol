"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { safePublicHref } from "@/lib/community";
import { ArtPoster } from "@/components/art/ArtPoster";
import { useSection, text, img } from "@/components/publicCms";
import { aboutText, cmsEmptyState } from "@/lib/data";

export function About() {
  const about = useSection("home_about");
  const content = text(about.section_text || about.text, "");
  const paragraphs = (
    !content || content === cmsEmptyState ? aboutText.join("\n") : content
  )
    .replace(/\\n/g, "\n")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const rawTitle = text(about.section_title, "");
  const title =
    !rawTitle || rawTitle === "Quem somos" || rawTitle === cmsEmptyState
      ? "Uma casa para criar. Um palco para transformar."
      : rawTitle;
  const image = img(about.image_url);
  const [failedImage, setFailedImage] = useState("");
  const showImage = Boolean(image) && failedImage !== image;
  return (
    <section id="quem-somos" className="identity-about py-16 md:py-20">
      <div className="identity-about-layout">
        <div className="identity-art-frame">
          <div className="identity-art-print">
            {showImage ? (
              <img
                src={image}
                alt={text(about.image_caption, "Associação Cultural Girassol")}
                loading="lazy"
                onError={() => setFailedImage(image)}
              />
            ) : (
              <ArtPoster title="Corpo, voz e criação teatral" />
            )}
            <span className="identity-art-stamp">
              {text(about.art_stamp,"GIRASSOL / CORPO. VOZ. PRESENÇA.")}
            </span>
          </div>
          <p className="identity-art-caption">
            {showImage
              ? text(about.image_caption, "Associação Cultural Girassol")
              : text(about.art_caption,"Composição original · O nosso universo criativo")}
          </p>
          <div className="identity-year">
            <strong>{text(about.founding_year,"1987")}</strong>
            <span>
              {text(about.year_caption,"UMA HISTÓRIA QUE CONTINUA EM MOVIMENTO.")}
            </span>
          </div>
        </div>
        <div className="identity-about-copy">
          <p className="editorial-eyebrow">
            {text(about.eyebrow, "RAÍZES EM MAPUTO. OLHOS NO MUNDO.")}
          </p>
          <h2>{title}</h2>
          <div className="identity-about-paragraphs">
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="identity-signature">
            <span>
              {text(about.signature,"Teatro. Juventude. Memória viva.")}
            </span>
            <Link href={safePublicHref(about.history_link)||"#historia"}>
              {text(about.history_button,"Percorra a nossa história")} <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
