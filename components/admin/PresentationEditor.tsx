"use client";
import {useEffect,useState} from "react";
import {presentationFields,resolvePresentation} from "@/lib/presentation";
import {supabase} from "@/lib/supabase";
export function PresentationEditor({values,blocked,onSaved}:{values:Record<string,string>;blocked:boolean;onSaved:(values:Record<string,string>)=>void}){
 const [draft,setDraft]=useState(()=>resolvePresentation(values));const [saving,setSaving]=useState(false);const [message,setMessage]=useState('');
 useEffect(()=>{setDraft(resolvePresentation(values));},[values]);
 async function save(){if(!supabase||blocked)return;setSaving(true);setMessage('');try{
 const changed=presentationFields.filter(f=>draft[f.key]!==resolvePresentation(values)[f.key]);
 if(!changed.length){setMessage('Não há alterações por guardar.');return;}
 for(const f of changed){if(f.type==='color'&&!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(draft[f.key]))throw Error(`Cor inválida: ${f.label}`);if(f.type==='number'&&(!draft[f.key]||!Number.isFinite(Number(draft[f.key]))||Number(draft[f.key])<(f.min??-Infinity)||Number(draft[f.key])>(f.max??Infinity)))throw Error(`Valor fora dos limites: ${f.label}`);}
 const payload=changed.map(f=>({key:f.key,value:draft[f.key]}));const {error}=await supabase.from('theme_settings').upsert(payload,{onConflict:'key'});if(error)throw error;
 const confirmed=await supabase.from('theme_settings').select('key,value').in('key',changed.map(f=>f.key));if(confirmed.error)throw confirmed.error;
 if(changed.some(f=>!confirmed.data?.some(row=>row.key===f.key&&String(row.value)===draft[f.key])))throw Error('A confirmação não devolveu todos os valores guardados. Actualize o painel antes de continuar.');
 onSaved(Object.fromEntries(payload.map(row=>[row.key,row.value])));setMessage('Guardado e confirmado. As alterações aparecem ao abrir ou actualizar o site.');
 }catch(error){setMessage(`Não foi possível guardar: ${error instanceof Error?error.message:String((error as {message?:string})?.message||error)}`);}finally{setSaving(false);}}
 return <div className="mt-6 space-y-6"><p className="text-sm text-zinc-300">Controle as duas paletas, os movimentos, os menus e as faixas. Os valores iniciais mantêm o desenho actual. Os textos e fotografias das secções são editados em Página inicial e FITI; os destinos do menu em Menus.</p>{blocked&&<p role="alert" className="text-amber-300">A carregar as definições ou ocorreu um erro de leitura. Actualize o painel antes de editar.</p>}
 <fieldset disabled={blocked||saving} className="space-y-6 disabled:opacity-60">{Array.from(new Set(presentationFields.map(f=>f.group))).map(group=><section key={group} className="rounded-2xl border border-white/10 p-5"><h3 className="mb-4 text-xl font-bold text-sun">{group}</h3><div className="grid gap-4 md:grid-cols-2">{presentationFields.filter(f=>f.group===group).map(f=><label key={f.key} className="text-sm text-zinc-300"><span>{f.label}</span>{f.type==='boolean'||f.type==='select'?<select aria-label={f.label} value={draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} className="mt-2 w-full rounded-xl bg-black/40 p-3">{(f.options??[['true','Activo'],['false','Inactivo']]).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>:<input aria-label={f.label} type={f.type} min={f.min} max={f.max} step={f.type==='number'?.1:undefined} value={draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} className="mt-2 min-h-11 w-full rounded-xl bg-black/40 p-3"/>}</label>)}</div></section>)}</fieldset>
 <button type="button" disabled={blocked||saving} onClick={save} className="rounded-full bg-sun px-6 py-3 font-bold text-black disabled:opacity-50">{saving?'A guardar apresentação…':'Guardar apresentação'}</button>{message&&<p role="status" className="rounded-xl border border-sun/30 p-4 text-sm text-sun">{message}</p>}</div>;
}
