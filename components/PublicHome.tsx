"use client";
import { Fragment, type ComponentType } from "react";
import { Members } from "@/components/community/Members";
import { AnnouncementRibbon } from "@/components/community/AnnouncementRibbon";
import { LivingBackdrop } from "@/components/ui/LivingBackdrop";
import { MotionControl } from "@/components/ui/MotionControl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FitiSpotlight } from "@/components/sections/FitiSpotlight";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { MissionVision } from "@/components/sections/MissionVision";
import { Timeline } from "@/components/sections/Timeline";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { Projects } from "@/components/sections/Projects";
import { Impact } from "@/components/sections/Impact";
import { Gallery } from "@/components/sections/Gallery";
import { News } from "@/components/sections/News";
import { Partners } from "@/components/sections/Partners";
import { Contact } from "@/components/sections/Contact";
import { cmsFallbackSections } from "@/lib/data";
import { usePublicRows } from "@/hooks/usePublicRows";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { text } from "@/components/publicCms";

const map: Record<string, ComponentType> = {
  home_hero: Hero,
  home_about: About,
  home_mission_vision: MissionVision,
  home_timeline: Timeline,
  home_what_we_do: WhatWeDo,
  home_projects: Projects,
  home_impact: Impact,
  home_gallery: Gallery,
  home_news: News,
  home_partners: Partners,
  home_contact: Contact,
};
export function PublicHome() {
  const { data: sections } = usePublicRows(
    "page_sections",
    cmsFallbackSections.filter((s) => s.page_slug === "home" && s.is_active),
    (q) => q.eq("page_slug", "home").eq("is_active", true).order("order_index"),
  );
  const { settings } = useThemeSettings();
  return (
    <div className="festival-site">
      <LivingBackdrop page />
      <MotionControl />
      <Navbar settings={settings as any} />
      <main className="public-content relative z-10">
        {sections.map((s) => {
          if (s.section_key === "home_partners") return null;
          const Component = map[s.section_key];
          return Component ? (
            <Fragment key={s.section_key}>
              {s.section_key === "home_contact" && <Members />}
              <Component />
              {s.section_key === "home_hero" && <FitiSpotlight />}
            </Fragment>
          ) : null;
        })}
        {!sections.some((s) => s.section_key === "home_contact") && <Members />}
        {sections.some((s) => s.section_key === "home_partners") && <Partners />}
      </main>
      <a
        aria-label="WhatsApp"
        className="fixed bottom-20 right-4 z-40 rounded-full bg-sun px-5 py-3 font-bold text-black shadow-2xl shadow-sun/30"
        href={text(
          (settings as any).whatsapp_url || (settings as any).whatsapp,
          "https://wa.me/?text=Olá%20Associação%20Cultural%20Girassol",
        )}
      >
        WhatsApp
      </a>
      <Footer settings={settings as any} />
      <AnnouncementRibbon />
    </div>
  );
}
