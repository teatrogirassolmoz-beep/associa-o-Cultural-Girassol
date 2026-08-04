'use client';

import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { text, useSection } from '@/components/publicCms';

export function MissionVision() {
  const fields = useSection('home_mission_vision');
  const values = text(fields.values, 'Criatividade\nInclusão\nJuventude\nMemória\nIntercâmbio')
    .replace(/\\n/g, '\n')
    .split(/\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <section id="missao-visao" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle eyebrow={text(fields.eyebrow, 'Identidade')} title={text(fields.section_title, 'Missão, visão e valores')} />
        <div className="grid gap-5 md:grid-cols-2">
          <Card><h3 className="text-2xl font-bold text-sun">Missão</h3><p className="mt-3 text-zinc-300">{text(fields.mission)}</p></Card>
          <Card><h3 className="text-2xl font-bold text-sun">Visão</h3><p className="mt-3 text-zinc-300">{text(fields.vision)}</p></Card>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {values.map((value) => <span className="rounded-full border border-sun/30 bg-sun/10 px-4 py-2 text-sun" key={value}>{value}</span>)}
        </div>
      </div>
    </section>
  );
}
