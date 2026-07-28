'use client';
import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useRows, img, useSection, text } from '@/components/publicCms';

function formatDate(value: unknown) {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-PT');
}

export function News() {
  const f = useSection('home_news');
  const rows = useRows('news', [] as any[], (q) => q.eq('published', true).order('created_at', { ascending: false }));

  return (
    <section id="noticias" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle eyebrow={text(f.eyebrow, 'Notícias')} title={text(f.section_title, 'Actualizações')} />
        {rows.length === 0 ? (
          <p className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 text-center text-zinc-300">Notícias em actualização.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {rows.map((news: any) => (
              <Card key={news.id || news.slug || news.title}>
                {img(news.image_url) && <img src={img(news.image_url)} alt={news.title} className="mb-4 aspect-video w-full rounded-2xl object-cover" />}
                <p className="text-sm uppercase tracking-widest text-sun">{[news.category, formatDate(news.created_at)].filter(Boolean).join(' • ')}</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{news.title}</h3>
                <p className="mt-2 text-zinc-400">{news.summary}</p>
                {news.content && (
                  <details className="group mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <summary className="cursor-pointer font-bold text-sun">Ler notícia completa</summary>
                    <div className="mt-4 whitespace-pre-line leading-7 text-zinc-300">{news.content}</div>
                  </details>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
