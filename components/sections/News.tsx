'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useRows, img, useSection, text } from '@/components/publicCms';

const PAGE_SIZE = 3;

function formatDate(value: unknown) {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-PT');
}

export function News() {
  const f = useSection('home_news');
  const rows = useRows('news', [] as any[], (q) => q.eq('published', true).order('created_at', { ascending: false }));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(event: KeyboardEvent) { if (event.key === 'Escape') setSelected(null); }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeyDown); };
  }, [selected]);

  return <section id="noticias" className="py-16 md:py-20">
    <div className="mx-auto max-w-7xl px-4">
      <SectionTitle eyebrow={text(f.eyebrow, 'Notícias')} title={text(f.section_title, 'Actualizações')} />
      {rows.length === 0 ? <p className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 text-center text-zinc-300">Notícias em actualização.</p> : <>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rows.slice(0, visibleCount).map((item: any) => <Card key={item.id || item.slug || item.title} className="flex h-full flex-col">
          {img(item.image_url) && <img src={img(item.image_url)} alt={item.title} loading="lazy" decoding="async" className="mb-4 aspect-video w-full rounded-2xl object-cover" />}
          <p className="text-sm uppercase tracking-widest text-sun">{[item.category, formatDate(item.created_at)].filter(Boolean).join(' • ')}</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{item.title}</h3><p className="mt-2 line-clamp-4 text-zinc-400">{item.summary}</p>
          <button type="button" onClick={() => setSelected(item)} className="mt-auto self-start pt-5 font-bold text-sun">Ler notícia</button>
        </Card>)}</div>
        <div className="mt-8 flex flex-col items-center gap-3"><p className="text-sm text-zinc-400">A mostrar {Math.min(visibleCount, rows.length)} de {rows.length} notícias</p>{visibleCount < rows.length && <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-full bg-sun px-5 py-3 font-bold text-black">Ver mais notícias (+3)</button>}</div>
      </>}
    </div>
    {selected && <div role="dialog" aria-modal="true" aria-label={selected.title} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <article className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/15 bg-zinc-950 p-5 shadow-2xl md:p-8">
        <button type="button" onClick={() => setSelected(null)} aria-label="Fechar notícia" className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white"><X /></button>
        {img(selected.image_url) && <img src={img(selected.image_url)} alt={selected.title} decoding="async" className="mb-6 max-h-[50vh] w-full rounded-2xl object-cover" />}
        <p className="pr-12 text-sm uppercase tracking-widest text-sun">{[selected.category, formatDate(selected.created_at)].filter(Boolean).join(' • ')}</p><h3 className="mt-2 text-3xl font-bold text-white">{selected.title}</h3>
        {selected.summary && <p className="mt-4 text-lg font-medium leading-8 text-zinc-300">{selected.summary}</p>}{selected.content && <div className="mt-6 whitespace-pre-line border-t border-white/10 pt-6 leading-7 text-zinc-300">{selected.content}</div>}
      </article>
    </div>}
  </section>;
}
