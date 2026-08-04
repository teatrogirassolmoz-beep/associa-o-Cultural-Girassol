'use client';

import { ChevronDown } from 'lucide-react';

const primaryItems = ['Dashboard', 'Páginas', 'Homepage', 'FITI'];

const groups = [
  {
    label: 'Site e identidade',
    items: ['Identidade Visual', 'Aparência', 'Media Library', 'Menus', 'Redes sociais', 'SEO'],
  },
  {
    label: 'Conteúdos',
    items: ['Galeria', 'Notícias', 'Projectos', 'Timeline', 'Impacto', 'Parceiros'],
  },
  {
    label: 'Gestão do FITI',
    items: ['Edições FITI', 'Programação FITI', 'Companhias FITI', 'Oficinas FITI', 'Inscrições FITI', 'Arquivo FITI'],
  },
  {
    label: 'Atendimento e sistema',
    items: ['Contactos', 'Imprensa', 'Formulários', 'Diagnóstico', 'Definições'],
  },
] as const;

const linkClass = 'block rounded-xl px-3 py-2 text-zinc-300 transition hover:bg-white/5 hover:text-sun focus:bg-white/5 focus:text-sun focus:outline-none';

export function AdminSidebar() {
  return <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-zinc-950/95 p-5 lg:flex">
    <div className="border-b border-white/10 pb-5">
      <p className="font-display text-2xl font-black text-sun">CMS Girassol</p>
      <p className="mt-1 text-xs text-zinc-500">Painel de gestão de conteúdos</p>
    </div>
    <nav className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 text-sm" aria-label="Menu do CMS">
      <div className="space-y-1">
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Visão geral</p>
        {primaryItems.map((item) => <a key={item} href={`#${item}`} className={linkClass}>{item}</a>)}
      </div>
      {groups.map((group, index) => <details key={group.label} open={index < 2} className="group rounded-2xl border border-white/5 bg-black/20">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-3 py-3 font-semibold text-zinc-200 hover:text-sun">
          {group.label}<ChevronDown size={15} className="transition group-open:rotate-180"/>
        </summary>
        <div className="space-y-1 border-t border-white/5 px-1 py-2">
          {group.items.map((item) => <a key={item} href={`#${item}`} className={linkClass}>{item}</a>)}
        </div>
      </details>)}
    </nav>
  </aside>;
}
