'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useRows, img, useSection, text } from '@/components/publicCms';

export function Program() {
  const fields = useSection('fiti_program');
  const editions = useRows('fiti_editions', [] as any[], (query) => query.eq('active', true).order('year', { ascending: false }).limit(1));
  const activeRows = useRows('fiti_program', [] as any[], (query) => query.eq('is_active', true).order('date').order('time'));
  const activeEditionId = editions[0]?.id;
  const rows = activeEditionId ? activeRows.filter((item: any) => item.edition_id === activeEditionId) : [];

  return <section id="programacao" className="py-16 md:py-20">
    <div className="mx-auto max-w-7xl px-4">
      <SectionTitle eyebrow={text(fields.eyebrow, 'Programação')} title={text(fields.section_title, 'Programação FITI')} />
      {rows.length === 0 ? <p className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 text-center text-zinc-300">{text(fields.empty_state_text, 'Programação em actualização.')}</p> : <div className="grid gap-5 md:grid-cols-2">
        {rows.map((item: any) => <Card key={item.id || item.title}>
          {img(item.image_url) && <img src={img(item.image_url)} alt={item.title} className="mb-4 aspect-video w-full rounded-2xl object-cover" />}
          <p className="text-sm uppercase tracking-widest text-sun">{item.date} • {item.time} • {item.venue}</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{item.title}</h3>
          <p className="text-zinc-300">{item.company} {item.country && `— ${item.country}`}</p>
          <p className="mt-2 text-zinc-400">{item.synopsis}</p>
          <p className="mt-2 text-sm text-zinc-500">{item.category} {item.duration && `• ${item.duration}`} {item.age_rating && `• ${item.age_rating}`}</p>
          {item.reservation_link && <Button href={item.reservation_link} className="mt-5">Reservar</Button>}
        </Card>)}
      </div>}
    </div>
  </section>;
}
