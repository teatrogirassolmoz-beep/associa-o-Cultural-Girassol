'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PageSection, SectionField } from '@/types/cms';
import { supabase } from '@/lib/supabase';
import { EditableField } from './EditableField';

type SaveArgs = {
  sectionId: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: SectionField['field_type'];
  value?: string;
  jsonValue?: SectionField['field_json'];
  orderIndex?: number;
};

type Confirmation = {
  section_id: string;
  field_key: string;
  field_value: string | null;
  field_json: SectionField['field_json'];
  updated_at: string | null;
};

const sectionGuidance: Record<string, { text: string; target?: string; targetLabel?: string }> = {
  home_hero: { text: 'Edite aqui todo o destaque inicial: chamada, título, descrição e os dois botões.' },
  home_about: { text: 'Edite aqui o texto institucional apresentado em “Quem somos”. Use parágrafos separados por uma mudança de linha.' },
  home_mission_vision: { text: 'Edite aqui a missão, a visão e os valores. Coloque um valor por linha.' },
  home_timeline: { text: 'Aqui edita apenas o título de apresentação. Os anos e acontecimentos são geridos em Conteúdos → Timeline.', target: 'Timeline', targetLabel: 'Abrir Timeline' },
  home_what_we_do: { text: 'Edite aqui o título e as áreas de actuação. O campo JSON deve manter uma lista de cartões com “title” e “description”.' },
  home_projects: { text: 'Aqui edita apenas o título de apresentação. Os projectos são geridos em Conteúdos → Projectos.', target: 'Projectos', targetLabel: 'Abrir Projectos' },
  home_impact: { text: 'Aqui edita apenas o título de apresentação. Os números e indicadores são geridos em Conteúdos → Impacto.', target: 'Impacto', targetLabel: 'Abrir Impacto' },
  home_gallery: { text: 'Aqui edita apenas o título de apresentação. As fotografias são geridas em Conteúdos → Galeria.', target: 'Galeria', targetLabel: 'Abrir Galeria' },
  home_news: { text: 'Aqui edita apenas o título de apresentação. As notícias completas são criadas em Conteúdos → Notícias.', target: 'Notícias', targetLabel: 'Abrir Notícias' },
  home_partners: { text: 'Aqui edita apenas o título de apresentação. Os logotipos e dados são geridos em Conteúdos → Parceiros.', target: 'Parceiros', targetLabel: 'Abrir Parceiros' },
  home_contact: { text: 'Edite aqui o título da área. Email, WhatsApp e localização são geridos em Site e identidade → Aparência; redes sociais em Redes sociais.' },
};

function jsonOrEmpty(field: SectionField, value: string) {
  if (field.field_type !== 'json') return null;
  try {
    return value.trim() ? JSON.parse(value) : {};
  } catch {
    return field.field_json ?? {};
  }
}

export async function saveSectionField({ sectionId, fieldKey, fieldLabel, fieldType, value, jsonValue, orderIndex }: SaveArgs) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const payload = {
    section_id: sectionId,
    field_key: fieldKey,
    field_label: fieldLabel,
    field_type: fieldType,
    field_value: typeof value === 'string' ? value : '',
    field_json: jsonValue ?? {},
    order_index: orderIndex ?? 0,
  };
  const { error } = await supabase.from('section_fields').upsert(payload, { onConflict: 'section_id,field_key' });
  if (error) throw error;
}

export function SectionEditor({ section, fields }: { section: PageSection; fields: SectionField[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedFields, setSavedFields] = useState<SectionField[]>(fields);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSavedFields(fields);
    setValues(Object.fromEntries(fields.map((field) => [field.field_key, field.field_type === 'json' ? JSON.stringify(field.field_json ?? {}, null, 2) : field.field_value ?? ''])));
    setMessage('');
  }, [fields, section.id]);

  const dirtyKeys = useMemo(() => savedFields.filter((field) => values[field.field_key] !== (field.field_type === 'json' ? JSON.stringify(field.field_json ?? {}, null, 2) : field.field_value ?? '')).map((field) => field.field_key), [savedFields, values]);

  async function save() {
    if (!supabase) return setMessage('Erro Supabase: Supabase não configurado.');
    setSaving(true);
    setMessage('A guardar em public.section_fields...');
    try {
      const fieldsByKey = new Map(savedFields.map((field) => [field.field_key, field]));
      for (const sourceField of savedFields) {
        const value = values[sourceField.field_key] ?? '';
        await saveSectionField({
          sectionId: section.id,
          fieldKey: sourceField.field_key,
          fieldLabel: sourceField.field_label,
          fieldType: sourceField.field_type,
          value: sourceField.field_type === 'json' ? '' : value,
          jsonValue: jsonOrEmpty(sourceField, value),
          orderIndex: sourceField.order_index,
        });
      }
      const { data, error } = await supabase.from('section_fields').select('id,section_id,field_key,field_label,field_type,field_value,field_json,order_index,created_at,updated_at').eq('section_id', section.id).order('order_index', { ascending: true }).order('field_key', { ascending: true });
      if (error) throw error;
      const confirmed = (data ?? []) as SectionField[];
      setSavedFields(confirmed.filter((field) => fieldsByKey.has(field.field_key)));
      setValues((current) => ({ ...current, ...Object.fromEntries(confirmed.map((field) => [field.field_key, field.field_type === 'json' ? JSON.stringify(field.field_json ?? {}, null, 2) : field.field_value ?? ''])) }));
      const titleConfirmation = (confirmed as Confirmation[]).find((field) => field.field_key === 'title') ?? (confirmed as Confirmation[])[0];
      setMessage(titleConfirmation ? `Guardado com sucesso. Tabela: section_fields · section_id: ${titleConfirmation.section_id} · Campo: ${titleConfirmation.field_key} · Valor confirmado: ${titleConfirmation.field_value ?? JSON.stringify(titleConfirmation.field_json ?? {})} · updated_at: ${titleConfirmation.updated_at}` : 'Guardado com sucesso, mas a confirmação não devolveu campos.');
    } catch (error) {
      setMessage(`Erro Supabase: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  }

  async function move(delta:number){if(!supabase)return;setSaving(true);const next=Math.max(0,section.order_index+delta);const{error}=await supabase.from('page_sections').update({order_index:next}).eq('id',section.id);setSaving(false);setMessage(error?`Erro Supabase: ${error.message}`:'Ordem actualizada. Recarregue o CMS para confirmar a nova posição.');}
  async function toggle(){if(!supabase)return;setSaving(true);const{error}=await supabase.from('page_sections').update({is_active:!section.is_active}).eq('id',section.id);setSaving(false);setMessage(error?`Erro Supabase: ${error.message}`:`Secção ${section.is_active?'ocultada':'publicada'} com sucesso.`);}

  const guidance=sectionGuidance[section.section_key];

  return <section id={section.section_name} className="scroll-mt-8 rounded-3xl border border-white/10 bg-zinc-950/80 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-2xl font-bold text-sun">{section.section_name}</h3><p className="text-sm text-zinc-400">Chave: {section.section_key} · ordem {section.order_index} · {dirtyKeys.length ? `${dirtyKeys.length} alteração(ões)` : 'sem alterações'}</p></div><div className="flex gap-2 text-xs"><a href={section.page_slug==='fiti'?'../fiti/':'../'} target="_blank" className="rounded-full border border-white/10 px-3 py-2">Pré-visualizar</a><button type="button" onClick={()=>move(-1)} className="rounded-full border border-white/10 px-3 py-2">Mover ↑</button><button type="button" onClick={()=>move(1)} className="rounded-full border border-white/10 px-3 py-2">Mover ↓</button><button type="button" onClick={toggle} className="rounded-full border border-white/10 px-3 py-2">{section.is_active?'Ocultar':'Publicar'}</button><button type="button" disabled={saving} onClick={save} className="rounded-full bg-sun px-3 py-2 font-bold text-black disabled:opacity-60">{saving ? 'A guardar...' : 'Guardar'}</button></div></div>{guidance&&<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sun/20 bg-sun/5 p-3 text-sm text-zinc-300"><span>{guidance.text}</span>{guidance.target&&<a href={`#${guidance.target}`} className="shrink-0 rounded-full border border-sun/30 px-3 py-2 font-bold text-sun">{guidance.targetLabel}</a>}</div>}<div className="mt-5 grid gap-4 md:grid-cols-2">{savedFields.map((field) => <EditableField key={field.id} field={{ ...field, field_value: values[field.field_key] ?? '' }} onChange={(value) => setValues((current) => ({ ...current, [field.field_key]: value }))} />)}</div>{message && <p className="mt-4 rounded-2xl border border-sun/20 bg-sun/10 p-3 text-sm text-sun">{message}</p>}</section>;
}
