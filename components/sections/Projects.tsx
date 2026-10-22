"use client";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { projects as fallback } from "@/lib/data";
import { GirassolArtwork } from "@/components/art/GirassolArtwork";
import { useRows, img, useSection, text } from "@/components/publicCms";

export function Projects() {
  const f = useSection("home_projects");
  const rows = useRows("projects", fallback as any[], (q) =>
    q
      .eq("is_active", true)
      .order("featured", { ascending: false })
      .order("order_index"),
  );
  return (
    <section id="projectos" className="art-projects py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <header className="art-section-heading">
          <div>
            <p className="editorial-eyebrow">
              {text(f.eyebrow, "O QUE NOS MOVE")}
            </p>
            <h2>{text(f.section_title, "Projectos")}</h2>
          </div>
          <p>
            {text(f.side_note,"Ideias que saem do papel. Arte que entra na vida.")}
          </p>
        </header>
        <div className="art-project-grid">
          {rows.map((project: any, i: number) => {
            const isFiti = String(project.title).toUpperCase().includes("FITI");
            return (
              <article
                className={`art-project ${isFiti ? "art-project-fiti" : ""}`}
                key={project.id || project.title}
              >
                <div className="art-project-image">
                  {img(project.image_url) ? (
                    <img
                      src={img(project.image_url)}
                      alt={project.title}
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <GirassolArtwork
                        variant={isFiti ? 3 : i}
                        title={project.title}
                      />
                      <div className="art-project-lettering" aria-hidden="true">
                        {isFiti ? (
                          <>
                            FI<em>TI.</em>
                          </>
                        ) : (
                          <>
                            {String(i + 1).padStart(2, "0")}
                            <span>
                              {text(f.art_phrase,"CRIAÇÃO EM MOVIMENTO.")}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="art-illustration-label">
                        {text(f.illustration_label,"COMPOSIÇÃO ORIGINAL")}
                      </span>
                    </>
                  )}
                  <span className="art-project-number">
                    {text(f.brand_label,"GIRASSOL")} / {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="art-project-copy">
                  <h3>{project.title}</h3>
                  <details>
                    <summary>
                      {text(f.details_label,"Sobre o projecto")} <Plus size={16} />
                    </summary>
                    <p>{project.description}</p>
                  </details>
                  {project.link && (
                    <Link href={project.link} className="art-project-link">
                      {isFiti ? text(f.fiti_link_label,"Entre no universo FITI") : text(f.project_link_label,"Explorar projecto")}
                      <ArrowUpRight size={18} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
