'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useRows, img, useSection, text } from '@/components/publicCms';
import { gallery } from '@/lib/data';

const PAGE_SIZE = 3;

export function Gallery() {
  const f = useSection('home_gallery');
  const rows = useRows('gallery', gallery as any[], (q) => q.eq('is_active', true).order('order_index'));
  const [filter, setFilter] = useState('Todos');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const categories = ['Todos', ...Array.from(new Set(rows.map((item: any) => item.category).filter(Boolean)))];
  const filteredItems = useMemo(() => filter === 'Todos' ? rows : rows.filter((item: any) => item.category === filter), [filter, rows]);
  const visibleItems = filteredItems.slice(0, visibleCount);
  const selected = selectedIndex === null ? null : filteredItems[selectedIndex];

  function chooseFilter(category: string) {
    setFilter(category);
    setVisibleCount(PAGE_SIZE);
    setSelectedIndex(null);
  }

  useEffect(() => {
    if (selectedIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedIndex(null);
      if (event.key === 'ArrowLeft') setSelectedIndex((current) => current === null ? null : (current - 1 + filteredItems.length) % filteredItems.length);
      if (event.key === 'ArrowRight') setSelectedIndex((current) => current === null ? null : (current + 1) % filteredItems.length);
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeyDown); };
  }, [filteredItems.length, selectedIndex]);

  return <section id="galeria" className="py-16 md:py-20">
    <div className="mx-auto max-w-7xl px-4">
      <SectionTitle eyebrow={text(f.eyebrow, 'Galeria')} title={text(f.section_title, 'Memória visual')} />
      <div className="mb-8 flex flex-wrap justify-center gap-3">{categories.map((category) => <button type="button" className={`rounded-full px-4 py-2 ${filter === category ? 'bg-sun text-black' : 'bg-white/10 text-white'}`} onClick={() => chooseFilter(category)} key={category}>{category}</button>)}</div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleItems.map((item: any, index: number) => <button type="button" onClick={() => setSelectedIndex(index)} className="text-left" key={item.id || `${item.title}-${index}`} aria-label={`Ampliar fotografia: ${item.title}`}><Card className="h-full">{img(item.image_url || item.imageUrl) ? <img src={img(item.image_url || item.imageUrl)} alt={item.alt_text || item.title} loading="lazy" decoding="async" className="mb-4 aspect-video w-full rounded-2xl object-cover" /> : <div className="mb-4 aspect-video rounded-2xl bg-gradient-to-br from-sun/25 to-ember/25" />}<p className="text-sun">{item.category}</p><h3 className="text-xl font-bold text-white">{item.title}</h3><p className="text-zinc-400">{item.description}</p></Card></button>)}</div>
      {filteredItems.length > 0 && <div className="mt-8 flex flex-col items-center gap-3"><p className="text-sm text-zinc-400">A mostrar {Math.min(visibleCount, filteredItems.length)} de {filteredItems.length} fotografias</p>{visibleCount < filteredItems.length && <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-full bg-sun px-5 py-3 font-bold text-black">Ver mais fotografias (+3)</button>}</div>}
    </div>
    {selected && <div role="dialog" aria-modal="true" aria-label={selected.title || 'Fotografia ampliada'} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedIndex(null); }}>
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/15 bg-zinc-950 p-5 shadow-2xl md:p-7">
        <button type="button" onClick={() => setSelectedIndex(null)} aria-label="Fechar fotografia" className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white"><X /></button>
        {img(selected.image_url || selected.imageUrl) ? <img src={img(selected.image_url || selected.imageUrl)} alt={selected.alt_text || selected.title} decoding="async" className="max-h-[65vh] w-full rounded-2xl object-contain" /> : <div className="aspect-video rounded-2xl bg-gradient-to-br from-sun/25 to-ember/25" />}
        <div className="mt-5 pr-12"><p className="text-sm uppercase tracking-widest text-sun">{selected.category}</p><h3 className="mt-1 text-2xl font-bold text-white">{selected.title}</h3>{selected.description && <p className="mt-2 text-zinc-300">{selected.description}</p>}</div>
        {filteredItems.length > 1 && <><button type="button" aria-label="Fotografia anterior" onClick={() => setSelectedIndex((selectedIndex! - 1 + filteredItems.length) % filteredItems.length)} className="absolute left-7 top-1/2 rounded-full bg-black/70 p-3 text-white"><ChevronLeft /></button><button type="button" aria-label="Fotografia seguinte" onClick={() => setSelectedIndex((selectedIndex! + 1) % filteredItems.length)} className="absolute right-7 top-1/2 rounded-full bg-black/70 p-3 text-white"><ChevronRight /></button></>}
      </div>
    </div>}
  </section>;
}
