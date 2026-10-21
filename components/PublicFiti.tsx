"use client";
import { Fragment, type ComponentType } from "react";
import { Members } from "@/components/community/Members";
import { AnnouncementRibbon } from "@/components/community/AnnouncementRibbon";
import { LivingBackdrop } from "@/components/ui/LivingBackdrop";
import { MotionControl } from "@/components/ui/MotionControl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FitiHero } from "@/components/fiti/FitiHero";
import { FitiAbout } from "@/components/fiti/FitiAbout";
import { CurrentEdition } from "@/components/fiti/CurrentEdition";
import { Program } from "@/components/fiti/Program";
import { Companies } from "@/components/fiti/Companies";
import { Workshops } from "@/components/fiti/Workshops";
import { Tickets } from "@/components/fiti/Tickets";
import { FitiArchive } from "@/components/fiti/FitiArchive";
import { FitiPartners } from "@/components/fiti/FitiPartners";
import { PressKit } from "@/components/fiti/PressKit";
import { FitiForms } from "@/components/fiti/FitiForms";
import { Contact } from "@/components/sections/Contact";
import { cmsFallbackSections } from "@/lib/data";
import { usePublicRows } from "@/hooks/usePublicRows";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { text } from "@/components/publicCms";
const FitiContact = () => <Contact sectionKey="fiti_contact" />;

const map: Record<string, ComponentType> = {
  fiti_hero: FitiHero,
  fiti_about: FitiAbout,
  fiti_current_edition: CurrentEdition,
  fiti_program: Program,
  fiti_companies: Companies,
  fiti_workshops: Workshops,
  fiti_tickets: Tickets,
  fiti_archive: FitiArchive,
  fiti_partners: FitiPartners,
  fiti_press: PressKit,
  fiti_forms: FitiForms,
  fiti_contact: FitiContact,
};
export function PublicFiti() {
  const { data: sections } = usePublicRows(
    "page_sections",
    cmsFallbackSections.filter((s) => s.page_slug === "fiti" && s.is_active),
    (q) => q.eq("page_slug", "fiti").eq("is_active", true).order("order_index"),
  );
  const { settings } = useThemeSettings();
  return (
    <div className="festival-site">
      <LivingBackdrop page />
      <MotionControl />
      <Navbar settings={settings as any} />
      <main className="public-content relative z-10">
        {sections.map((s) => {
          const Component = map[s.section_key];
          return Component ? (
            <Fragment key={s.section_key}>
              {s.section_key === "fiti_contact" && <Members fiti />}
              <Component />
            </Fragment>
          ) : null;
        })}
        {!sections.some((s) => s.section_key === "fiti_contact") && (
          <Members fiti />
        )}
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
