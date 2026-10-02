'use client';

import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { timeline as fallback } from '@/lib/data';
import { useRows, useSection, text } from '@/components/publicCms';

export function Timeline() {
  const fields = useSection('home_timeline');
  const rows = useRows('timeline', fallback as any[], (query) => query.eq('is_active', true).order('order_index'));

  return <section id="historia" className="py-16 md:py-20">
    <div className="mx-auto max-w-7xl px-4">
      <div className="[&>div]:mb-8">
        <SectionTitle eyebrow={text(fields.eyebrow, 'História')} title={text(fields.section_title, 'Linha do tempo')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((item: any) => <Card key={item.id || item.year} className="p-5">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="shrink-0 text-sun" />
            <p className="text-2xl font-black text-ember">{item.year}</p>
          </div>
          <h3 className="mt-3 text-lg font-bold leading-snug text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
        </Card>)}
      </div>
    </div>
  </section>;
}
