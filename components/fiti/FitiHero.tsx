'use client';

import { Button } from '@/components/ui/Button';
import { AdminLogoLink } from '@/components/ui/AdminLogoLink';
import { FitiLogo } from '@/components/ui/FitiLogo';
import { ManagedLogo } from '@/components/ui/ManagedLogo';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { useSection, text } from '@/components/publicCms';

export function FitiHero() {
  const fields = useSection('fiti_hero');

  return <section id="fiti-inicio" className="relative flex min-h-screen items-center overflow-hidden pb-20 pt-52 md:pb-28 md:pt-60">
    <VideoBackground src={text(fields.background_video_url, '/videos/fiti-hero.mp4')} />
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/72 to-black" />
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <AdminLogoLink href="/fiti#fiti-inicio" className="mb-10 inline-flex" ariaLabel="Ir para o início do FITI">
        <ManagedLogo debugLabel="FITI Hero" settingKey="fiti_logo_url" alt="FITI – Festival Internacional Teatro de Inverno" className="h-28 max-w-[320px] w-auto object-contain md:h-36" fallback={<FitiLogo />} />
      </AdminLogoLink>
      <p className="mb-5 text-sm font-bold uppercase tracking-[.4em] text-sun">{text(fields.eyebrow, 'Festival Internacional Teatro de Inverno')}</p>
      <h1 className="max-w-5xl font-display text-4xl font-black leading-[1.08] text-white md:text-7xl">{text(fields.title, 'FITI – Festival Internacional Teatro de Inverno')}</h1>
      <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-100 md:text-xl">{text(fields.subtitle, 'Uma plataforma de teatro, intercâmbio, formação e circulação artística.')}</p>
      <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg md:leading-9">{text(fields.description)}</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button href={text(fields.primary_button_url || fields.primary_button_link, '#programacao')}>{text(fields.primary_button_label || fields.primary_button_text, 'Ver programação')}</Button>
        <Button href={text(fields.secondary_button_url || fields.secondary_button_link, '#formularios')} variant="ghost">{text(fields.secondary_button_label || fields.secondary_button_text, 'Inscrever companhia')}</Button>
        <Button href="#contacto" variant="ghost">Contactar organização</Button>
      </div>
    </div>
  </section>;
}
