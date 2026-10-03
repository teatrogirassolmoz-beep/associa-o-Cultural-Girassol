'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

type WhatWeDoCard = { title: string; description: string };

function parseCards(value: string): { cards: WhatWeDoCard[]; error: string } {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return { cards: [], error: 'O conteúdo deve ser uma lista de cartões.' };
    if (parsed.some((card) => !card || typeof card !== 'object' || typeof (card as WhatWeDoCard).title !== 'string' || typeof (card as WhatWeDoCard).description !== 'string')) {
      return { cards: [], error: 'Cada cartão deve ter um título e uma descrição.' };
    }
    return { cards: parsed as WhatWeDoCard[], error: '' };
  } catch {
    return { cards: [], error: 'O conteúdo guardado não é JSON válido.' };
  }
}

export function WhatWeDoCardsField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { cards, error } = parseCards(value);
  const update = (next: WhatWeDoCard[]) => onChange(JSON.stringify(next, null, 2));

  function updateCard(index: number, key: keyof WhatWeDoCard, nextValue: string) {
    update(cards.map((card, cardIndex) => cardIndex === index ? { ...card, [key]: nextValue } : card));
  }

  function move(index: number, delta: number) {
    const destination = index + delta;
    if (destination < 0 || destination >= cards.length) return;
    const next = [...cards];
    [next[index], next[destination]] = [next[destination], next[index]];
    update(next);
  }

  if (error) {
    return <label className="block text-sm text-zinc-300 md:col-span-2">
      <span>Áreas de actuação</span>
      <p className="mt-2 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-red-200">{error} Corrija o JSON abaixo para recuperar o editor visual.</p>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-48 w-full rounded-2xl border border-red-400/30 bg-black/40 px-4 py-3 font-mono text-sm text-white outline-none focus:border-sun" />
    </label>;
  }

  return <fieldset className="space-y-4 md:col-span-2">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <legend className="font-bold text-white">Áreas de actuação</legend>
        <p className="mt-1 text-sm text-zinc-400">Adicione, edite e ordene os cartões apresentados na Homepage.</p>
      </div>
      <button type="button" onClick={() => update([...cards, { title: '', description: '' }])} className="inline-flex items-center gap-2 rounded-full border border-sun/30 px-4 py-2 text-sm font-bold text-sun transition hover:bg-sun/10">
        <Plus size={16} /> Adicionar área
      </button>
    </div>

    {cards.length === 0 && <p className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm text-zinc-400">Ainda não existem áreas. Use “Adicionar área” para criar o primeiro cartão.</p>}

    <div className="grid gap-4 lg:grid-cols-2">
      {cards.map((card, index) => <div key={index} className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun font-bold text-black">{index + 1}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Mover ${card.title || `área ${index + 1}`} para cima`} className="rounded-full border border-white/10 p-2 text-zinc-300 transition hover:border-sun hover:text-sun disabled:cursor-not-allowed disabled:opacity-30"><ArrowUp size={16} /></button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === cards.length - 1} aria-label={`Mover ${card.title || `área ${index + 1}`} para baixo`} className="rounded-full border border-white/10 p-2 text-zinc-300 transition hover:border-sun hover:text-sun disabled:cursor-not-allowed disabled:opacity-30"><ArrowDown size={16} /></button>
            <button type="button" onClick={() => update(cards.filter((_, cardIndex) => cardIndex !== index))} aria-label={`Remover ${card.title || `área ${index + 1}`}`} className="rounded-full border border-red-400/20 p-2 text-red-300 transition hover:bg-red-400/10"><Trash2 size={16} /></button>
          </div>
        </div>
        <label className="block text-sm text-zinc-300">
          Título
          <input value={card.title} onChange={(event) => updateCard(index, 'title', event.target.value)} placeholder="Ex.: Formação artística" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-sun" />
        </label>
        <label className="mt-4 block text-sm text-zinc-300">
          Descrição
          <textarea value={card.description} onChange={(event) => updateCard(index, 'description', event.target.value)} placeholder="Descreva esta área de actuação." className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-sun" />
        </label>
      </div>)}
    </div>
  </fieldset>;
}
