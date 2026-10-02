'use client';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';
import { GirassolLogo } from '@/components/ui/GirassolLogo';
import { ManagedLogo } from '@/components/ui/ManagedLogo';
import { useSection, text } from '@/components/publicCms';

export function About() {
  const about = useSection('home_about');
  const paragraphs = text(about.section_text || about.text).replace(/\\n/g, '\n').split('\n').map((paragraph)=>paragraph.trim()).filter(Boolean);
  return <section id="quem-somos" className="py-16 md:py-20"><div className="mx-auto max-w-7xl px-4"><SectionTitle eyebrow={text(about.eyebrow,'Quem Somos')} title={text(about.section_title,'Uma casa para criação, formação e encontro')}/><div className="grid items-center gap-8 md:grid-cols-[minmax(16rem,.65fr)_1.35fr]"><Card className="flex flex-col items-center p-4 md:p-5"><ManagedLogo debugLabel="About" settingKey="site_logo_url" alt="Associação Cultural Girassol" className="mx-auto max-h-72 w-auto max-w-full" fallback={<GirassolLogo className="max-h-72 max-w-full"/>}/><p className="mt-3 text-center text-sm text-sun">{text(about.image_caption,'Marca institucional da Associação Cultural Girassol')}</p></Card><div className="space-y-4 text-base leading-7 text-zinc-300 md:text-lg md:leading-8">{paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div></div></div></section>;
}
