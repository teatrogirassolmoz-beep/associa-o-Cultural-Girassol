'use client';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';
import { GirassolLogo } from '@/components/ui/GirassolLogo';
import { ManagedLogo } from '@/components/ui/ManagedLogo';
import { useSection, text } from '@/components/publicCms';

export function About() {
  const about = useSection('home_about');
  const paragraphs = text(about.section_text || about.text).replace(/\\n/g, '\n').split('\n').map((paragraph)=>paragraph.trim()).filter(Boolean);
  return <section id="quem-somos" className="py-24"><div className="mx-auto max-w-7xl px-4"><SectionTitle eyebrow={text(about.eyebrow,'Quem Somos')} title={text(about.section_title,'Uma casa para criação, formação e encontro')}/><div className="grid gap-8 md:grid-cols-[.8fr_1.2fr]"><Card><ManagedLogo debugLabel="About" settingKey="site_logo_url" alt="Associação Cultural Girassol" className="mx-auto" fallback={<GirassolLogo/>}/><p className="mt-6 text-center text-sun">{text(about.image_caption,'Marca institucional da Associação Cultural Girassol')}</p></Card><div className="space-y-5 text-lg leading-8 text-zinc-300">{paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div></div></div></section>;
}
