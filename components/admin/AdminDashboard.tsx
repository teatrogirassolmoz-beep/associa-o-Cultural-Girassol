'use client';

import type { FormEvent } from 'react';
import type { PageSection, SectionField } from '@/types/cms';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Database, Download, FileText, Image as ImageIcon, LogOut, Mail, Newspaper, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cmsFallbackSections, cmsFallbackFields, cmsFallbackTheme, cmsFallbackNavigation, gallery, news, partners, projects, timeline, impactStats, program, companies, workshops, archive } from '@/lib/data';
import { toSafeString } from '@/lib/utils';
import { AdminLayout } from './AdminLayout';
import { SectionEditor } from './SectionEditor';
import { EditableField } from './EditableField';
import { VisualIdentityField } from './VisualIdentityField';
import { MediaLibrary } from './MediaLibrary';
import { SupabaseDiagnostics } from './SupabaseDiagnostics';

type ManagerField = { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'boolean' | 'url' | 'date' };
type Row = Record<string, unknown> & { id?: string };
type DashboardStats = { messages: number; newMessages: number; applications: number; newApplications: number; news: number; media: number };

const emptyDashboardStats: DashboardStats = { messages: 0, newMessages: 0, applications: 0, newApplications: 0, news: 0, media: 0 };

const themeKeys = ['primary_color','secondary_color','accent_color','background_color','text_color','card_color','button_style','dominant_yellow_enabled','animated_background_enabled','background_motion_intensity','background_type','gradient_from','gradient_to','background_image_url','background_video_url','particles_enabled','stage_lights_enabled','overlay_opacity','border_radius','font_heading','font_body','whatsapp_url','contact_email','contact_location','footer_text'] as const;
const themeLabels: Record<string, string> = { primary_color:'Cor principal', secondary_color:'Cor secundária', accent_color:'Cor de destaque', background_color:'Cor de fundo', text_color:'Cor do texto', card_color:'Cor dos cartões', button_style:'Estilo dos botões', dominant_yellow_enabled:'Amarelo dominante', animated_background_enabled:'Fundo animado activo', background_motion_intensity:'Intensidade do movimento', background_type:'Tipo de fundo', gradient_from:'Gradiente inicial', gradient_to:'Gradiente final', background_image_url:'Imagem de fundo', background_video_url:'Vídeo de fundo', particles_enabled:'Partículas activas', stage_lights_enabled:'Luzes de palco activas', overlay_opacity:'Opacidade da camada', border_radius:'Arredondamento', font_heading:'Fonte dos títulos', font_body:'Fonte do corpo', whatsapp_url:'Link do WhatsApp', contact_email:'Email institucional', contact_location:'Localização', footer_text:'Texto do rodapé' };
const visualIdentitySections=[{title:'Logotipo da Associação',fields:[['site_logo_url','Logotipo principal da Associação','Usado na navbar, hero principal e rodapé','url'],['site_logo_alt','Texto alternativo do logotipo principal','Texto descritivo para acessibilidade','text']]},{title:'Logotipo do FITI',fields:[['fiti_logo_url','Logotipo do FITI','Usado na página FITI, hero FITI, arquivo FITI e rodapé','url'],['fiti_logo_alt','Texto alternativo FITI','Texto descritivo para acessibilidade','text']]},{title:'Favicon',fields:[['favicon_url','Favicon','Ícone do separador do navegador','url']]},{title:'Rodapé e Hero',fields:[['footer_logo_url','Logo do rodapé','Substitui o logotipo principal apenas no rodapé','url'],['hero_logo_url','Logo do hero principal','Substitui o logotipo principal apenas no hero','url']]},{title:'Fundo animado',fields:[['animated_logo_url','Logo do fundo animado','Controla o símbolo em movimento nos fundos','url'],['animated_logo_enabled','Activar logo em movimento','Liga ou desliga o logo em movimento','boolean'],['animated_logo_opacity','Opacidade do logo em movimento','Valor recomendado: 0.08','number'],['animated_logo_speed','Velocidade do logo em movimento','Valor recomendado: 42','number']]}] as const;
const selectKeys = new Set(['background_motion_intensity','background_type','button_style']);

const tableColumns: Record<string, readonly string[]> = {
  pages: ['slug','title','seo_title','seo_description','share_image_url','is_published'],
  news: ['title','slug','summary','content','image_url','category','published'],
  projects: ['title','description','image_url','link','featured','order_index','is_active'],
  gallery: ['title','image_url','category','description','alt_text','order_index','is_active'],
  partners: ['name','logo_url','category','link','show_on_home','show_on_fiti','order_index','is_active'],
  timeline: ['year','title','description','order_index','is_active'],
  impact_stats: ['label','value','suffix','order_index','is_active'],
  navigation_items: ['location','label','url','page_slug','order_index','is_active','is_external'],
  social_links: ['platform','label','url','is_active','order_index'],
  fiti_editions: ['year','theme','dates','locations','countries','description','curatorial_text','poster_url','active'],
  fiti_program: ['edition_id','date','time','title','company','country','venue','category','synopsis','duration','age_rating','image_url','reservation_link','is_active'],
  fiti_companies: ['edition_id','name','country','city','description','image_url','social_link','show_title','order_index','is_active'],
  fiti_workshops: ['edition_id','title','trainer','date','time','venue','vacancies','target_audience','description','registration_link','is_active'],
  fiti_archive: ['year','theme','dates','description','poster_url','program_pdf_url','gallery','video_url','is_active'],
  media_assets: ['title','description','file_url','file_type','mime_type','alt_text','storage_path'],
  theme_settings: ['key','value','value_json'],
  contact_messages: ['name','email','phone','subject','message','type','status'],
  fiti_applications: ['type','company_name','country','city','contact_person','email','phone','show_title','synopsis','duration','team_size','technical_needs','video_link','portfolio_link','notes','status'],
};

const booleanFields = new Set(['is_published','published','featured','is_active','is_external','show_on_home','show_on_fiti','active']);
const numberFields = new Set(['order_index','year','value','vacancies']);

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function coerceValue(key: string, value: unknown) {
  if (value === undefined) return undefined;
  if (booleanFields.has(key)) return value === true || value === 'true';
  if (numberFields.has(key)) return value === '' || value === null ? null : Number(value);
  return value;
}

function cleanPayloadForTable(tableName: string, payload: Row) {
  const allowed = tableColumns[tableName] ?? [];
  const source = { ...payload };
  if (tableName === 'news' && !toSafeString(source.slug) && toSafeString(source.title)) source.slug = slugify(toSafeString(source.title));
  return Object.fromEntries(allowed.flatMap((key) => {
    const value = coerceValue(key, source[key]);
    return value === undefined ? [] : [[key, value]];
  }));
}

async function saveThemeSetting(key:string,value:string){
  if(!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.from('theme_settings').upsert({key,value},{onConflict:'key'});
  if (error) throw error;
}

function emptyRow(fields: readonly ManagerField[]): Row { return Object.fromEntries(fields.map((field) => [field.key, field.type === 'boolean' ? true : ''])); }
function cellValue(row: Row, key: string) { const value = row[key]; return typeof value === 'boolean' ? String(value) : toSafeString(value); }

function CollectionManager({ title, table, fields, fallbackRows, readOnly = false, filters = {}, editableKeys, previewPathKey }: { title: string; table: string; fields: readonly ManagerField[]; fallbackRows: Row[]; readOnly?: boolean; filters?: Record<string,string>; editableKeys?: readonly string[]; previewPathKey?: string }) {
  const [rows, setRows] = useState<Row[]>(fallbackRows);
  const [selected, setSelected] = useState<Row>(fallbackRows[0] ?? emptyRow(fields));
  const [message, setMessage] = useState('');
  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    if (!supabase) return;
    let query = supabase.from(table).select('*');
    const activeFilters = JSON.parse(filterKey) as Record<string,string>;
    Object.entries(activeFilters).forEach(([key, value]) => { query = query.eq(key, value); });
    query.order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setMessage(`Fallback activo: ${error.message}`);
      if (data) {
        const nextRows = data.length ? data as Row[] : fallbackRows;
        setRows(nextRows);
        setSelected(nextRows[0] ?? emptyRow(fields));
      }
    });
  }, [table, filterKey, fallbackRows, fields]);
  function update(key: string, value: string) {
    if (readOnly || (editableKeys && !editableKeys.includes(key))) return;
    setSelected((current) => ({ ...current, [key]: value }));
  }
  async function save() {
    if (readOnly) return setMessage('Esta área é apenas para consulta.');
    if (!supabase) return setMessage('Supabase não configurado: edite depois de configurar as variáveis públicas.');
    if (!tableColumns[table]) return setMessage(`Tabela sem mapa de escrita seguro: ${table}.`);
    const payload = cleanPayloadForTable(table, selected);
    const result = selected.id ? await supabase.from(table).update(payload).eq('id', selected.id).select('*').single() : await supabase.from(table).insert(payload).select('*').single();
    if (result.error) return setMessage(result.error.message);
    const saved = result.data as Row;
    const confirm = saved.id ? await supabase.from(table).select('*').eq('id', saved.id).single() : { data: saved, error: null };
    if (confirm.error) return setMessage(`Guardado, mas a confirmação falhou: ${confirm.error.message}`);
    const confirmed = confirm.data as Row;
    setRows((current) => selected.id ? current.map((row) => row.id === selected.id ? confirmed : row) : [confirmed, ...current]);
    setSelected(confirmed);
    const firstKey = fields[0]?.key ?? 'id';
    setMessage(`Guardado com sucesso. Tabela: ${table} · ID: ${toSafeString(confirmed.id)} · Valor confirmado: ${cellValue(confirmed, firstKey)}${toSafeString(confirmed.updated_at) ? ` · updated_at: ${toSafeString(confirmed.updated_at)}` : ''}`);
  }
  async function remove(row: Row) { if (!supabase || !row.id || readOnly) return; if (!confirm(`Apagar item de ${title}?`)) return; const { error } = await supabase.from(table).delete().eq('id', row.id); if (error) return setMessage(error.message); setRows((current) => current.filter((item) => item.id !== row.id)); setSelected(emptyRow(fields)); setMessage('Item apagado.'); }
  const previewSlug=previewPathKey?cellValue(selected,previewPathKey):'';
  const previewHref=previewSlug==='home'?'/':previewSlug?`/${previewSlug}`:'';
  return <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]"><div className="space-y-2">{rows.map((row, index) => <button key={row.id ?? index} type="button" onClick={() => setSelected(row)} className={`block w-full rounded-2xl border bg-black/30 p-3 text-left transition ${selected.id===row.id?'border-sun/60 shadow-[0_0_20px_rgba(255,190,0,0.08)]':'border-white/10 hover:border-sun'}`}><b className="text-white">{cellValue(row, fields[0].key) || `${title} ${index + 1}`}</b><p className="text-xs text-zinc-400">{fields.slice(1, 3).map((f) => cellValue(row, f.key)).filter(Boolean).join(' · ') || 'Item editável'}</p></button>)}</div><div className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="mb-3 flex flex-wrap gap-2">{!readOnly&&!editableKeys&&<button type="button" onClick={() => setSelected(emptyRow(fields))} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm"><Plus size={16}/> Novo</button>}{!readOnly&&<button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-full bg-sun px-3 py-2 text-sm font-bold text-black"><Save size={16}/> Guardar alterações</button>}{previewHref&&<Link href={previewHref} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm">Ver página</Link>}{selected.id && !readOnly && !editableKeys && <button type="button" onClick={() => remove(selected)} className="inline-flex items-center gap-2 rounded-full border border-red-500/40 px-3 py-2 text-sm text-red-100"><Trash2 size={16}/> Apagar</button>}</div><div className="grid gap-3 md:grid-cols-2">{fields.map((field) => {const disabled=readOnly||Boolean(editableKeys&&!editableKeys.includes(field.key));return <label key={field.key} className="text-sm text-zinc-300"><span>{field.label}</span>{field.type === 'textarea' ? <textarea disabled={disabled} value={cellValue(selected, field.key)} onChange={(e) => update(field.key, e.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60" /> : field.type === 'boolean' ? <select disabled={disabled} value={cellValue(selected, field.key) || 'true'} onChange={(e) => update(field.key, e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"><option value="true">Activo</option><option value="false">Inactivo</option></select> : <input disabled={disabled} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'} value={cellValue(selected, field.key)} onChange={(e) => update(field.key, e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60" />}</label>})}</div>{message && <p className="mt-3 rounded-xl border border-sun/20 bg-sun/10 p-3 text-sm text-sun">{message}</p>}</div></div>;
}

const managers = [
  {area:'Menus',table:'navigation_items',fields:[{key:'label',label:'Etiqueta'},{key:'url',label:'URL',type:'url'},{key:'page_slug',label:'Página slug'},{key:'location',label:'Menu'},{key:'order_index',label:'Ordem',type:'number'},{key:'is_active',label:'Activo',type:'boolean'},{key:'is_external',label:'Externo',type:'boolean'}],fallbackRows:cmsFallbackNavigation},
  {area:'Redes sociais',table:'social_links',fields:[{key:'platform',label:'Plataforma'},{key:'label',label:'Etiqueta'},{key:'url',label:'URL',type:'url'},{key:'order_index',label:'Ordem',type:'number'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:[]},
  {area:'Galeria',table:'gallery',fields:[{key:'title',label:'Título'},{key:'category',label:'Categoria'},{key:'image_url',label:'Imagem',type:'url'},{key:'description',label:'Descrição',type:'textarea'},{key:'alt_text',label:'Texto alternativo'},{key:'order_index',label:'Ordem',type:'number'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:gallery},
  {area:'Notícias',table:'news',fields:[{key:'title',label:'Título'},{key:'slug',label:'Slug'},{key:'summary',label:'Resumo',type:'textarea'},{key:'content',label:'Conteúdo',type:'textarea'},{key:'image_url',label:'Imagem',type:'url'},{key:'category',label:'Categoria'},{key:'published',label:'Publicado',type:'boolean'}],fallbackRows:news},
  {area:'Projectos',table:'projects',fields:[{key:'title',label:'Título'},{key:'description',label:'Descrição',type:'textarea'},{key:'image_url',label:'Imagem',type:'url'},{key:'link',label:'Link',type:'url'},{key:'featured',label:'Destaque',type:'boolean'},{key:'order_index',label:'Ordem',type:'number'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:projects},
  {area:'Timeline',table:'timeline',fields:[{key:'year',label:'Ano'},{key:'title',label:'Título'},{key:'description',label:'Descrição',type:'textarea'},{key:'order_index',label:'Ordem',type:'number'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:timeline},
  {area:'Impacto',table:'impact_stats',fields:[{key:'label',label:'Indicador'},{key:'value',label:'Valor',type:'number'},{key:'suffix',label:'Sufixo'},{key:'order_index',label:'Ordem',type:'number'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:impactStats.map((label, order_index) => ({ label, value: 0, suffix: '', order_index, is_active: true }))},
  {area:'Parceiros',table:'partners',fields:[{key:'name',label:'Nome'},{key:'category',label:'Categoria'},{key:'logo_url',label:'Logotipo',type:'url'},{key:'link',label:'Link',type:'url'},{key:'show_on_home',label:'Homepage',type:'boolean'},{key:'show_on_fiti',label:'FITI',type:'boolean'},{key:'order_index',label:'Ordem',type:'number'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:partners},
  {area:'Edições FITI',table:'fiti_editions',fields:[{key:'year',label:'Ano',type:'number'},{key:'theme',label:'Tema'},{key:'dates',label:'Datas'},{key:'locations',label:'Locais'},{key:'countries',label:'Países'},{key:'description',label:'Descrição',type:'textarea'},{key:'curatorial_text',label:'Texto curatorial',type:'textarea'},{key:'poster_url',label:'Cartaz',type:'url'},{key:'active',label:'Activo',type:'boolean'}],fallbackRows:[]},
  {area:'Programação FITI',table:'fiti_program',fields:[{key:'title',label:'Título'},{key:'edition_id',label:'Edição ID'},{key:'date',label:'Data',type:'date'},{key:'time',label:'Hora'},{key:'company',label:'Companhia'},{key:'country',label:'País'},{key:'venue',label:'Local'},{key:'category',label:'Categoria'},{key:'synopsis',label:'Sinopse',type:'textarea'},{key:'duration',label:'Duração'},{key:'age_rating',label:'Classificação etária'},{key:'image_url',label:'Imagem',type:'url'},{key:'reservation_link',label:'Reserva',type:'url'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:program},
  {area:'Companhias FITI',table:'fiti_companies',fields:[{key:'edition_id',label:'Edição ID'},{key:'name',label:'Nome'},{key:'country',label:'País'},{key:'city',label:'Cidade'},{key:'description',label:'Descrição',type:'textarea'},{key:'image_url',label:'Imagem',type:'url'},{key:'social_link',label:'Rede social',type:'url'},{key:'show_title',label:'Espectáculo'},{key:'order_index',label:'Ordem',type:'number'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:companies},
  {area:'Oficinas FITI',table:'fiti_workshops',fields:[{key:'edition_id',label:'Edição ID'},{key:'title',label:'Título'},{key:'trainer',label:'Formador'},{key:'date',label:'Data',type:'date'},{key:'time',label:'Hora'},{key:'venue',label:'Local'},{key:'vacancies',label:'Vagas',type:'number'},{key:'target_audience',label:'Público-alvo'},{key:'description',label:'Descrição',type:'textarea'},{key:'registration_link',label:'Inscrição',type:'url'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:workshops},
  {area:'Inscrições FITI',table:'fiti_applications',fields:[{key:'type',label:'Tipo'},{key:'company_name',label:'Companhia'},{key:'country',label:'País'},{key:'city',label:'Cidade'},{key:'contact_person',label:'Pessoa de contacto'},{key:'email',label:'Email'},{key:'phone',label:'Telefone'},{key:'show_title',label:'Espectáculo'},{key:'synopsis',label:'Sinopse',type:'textarea'},{key:'duration',label:'Duração'},{key:'team_size',label:'Número de integrantes'},{key:'technical_needs',label:'Necessidades técnicas',type:'textarea'},{key:'video_link',label:'Vídeo',type:'url'},{key:'portfolio_link',label:'Portfólio',type:'url'},{key:'notes',label:'Observações',type:'textarea'},{key:'status',label:'Estado'}],fallbackRows:[]},
  {area:'Arquivo FITI',table:'fiti_archive',fields:[{key:'year',label:'Ano',type:'number'},{key:'theme',label:'Tema'},{key:'dates',label:'Datas'},{key:'description',label:'Descrição',type:'textarea'},{key:'poster_url',label:'Cartaz',type:'url'},{key:'program_pdf_url',label:'Programa PDF',type:'url'},{key:'gallery',label:'Galeria JSON',type:'textarea'},{key:'video_url',label:'Vídeo',type:'url'},{key:'is_active',label:'Activo',type:'boolean'}],fallbackRows:archive},
] as const;

export function AdminDashboard(){
  const[session,setSession]=useState(false);const[email,setEmail]=useState('');const[sessionEmail,setSessionEmail]=useState('');const[password,setPassword]=useState('');const[loginError,setLoginError]=useState('');const[loading,setLoading]=useState(false);const[themeValues,setThemeValues]=useState<Record<string,string>>({});const[adminSections,setAdminSections]=useState<PageSection[]>(cmsFallbackSections);const[adminFields,setAdminFields]=useState<Record<string,SectionField[]>>(cmsFallbackFields);const[dashboardStats,setDashboardStats]=useState<DashboardStats>(emptyDashboardStats);const[dashboardLoading,setDashboardLoading]=useState(false);const[dashboardError,setDashboardError]=useState('');
  useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>{setSession(Boolean(data.session));setSessionEmail(data.session?.user.email??'');});const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,currentSession)=>{setSession(Boolean(currentSession));setSessionEmail(currentSession?.user.email??'');});return()=>subscription.unsubscribe();},[]);
  useEffect(()=>{if(!supabase||!session)return;supabase.from('theme_settings').select('key,value').then(({data})=>{if(data)setThemeValues(Object.fromEntries(data.map(row=>[row.key,toSafeString(row.value)])));});},[session]);
  useEffect(()=>{if(!supabase||!session)return;async function loadSectionFields(){const{data,error}=await supabase!.from('page_sections').select('*, fields:section_fields(*)').in('page_slug',['home','fiti']).order('order_index',{ascending:true});if(error||!data?.length)return;setAdminSections(data.map(({fields: _fields,...section})=>section as PageSection));setAdminFields(current=>{const next={...current};data.forEach((section)=>{const loadedFields=Array.isArray(section.fields)?section.fields:[];if(loadedFields.length)next[section.section_key]=(loadedFields as SectionField[]).sort((a,b)=>(a.order_index??0)-(b.order_index??0)||String(a.field_key).localeCompare(String(b.field_key)));});return next;});}loadSectionFields();},[session]);
  async function loadDashboardStats(){
    if(!supabase||!session)return;
    setDashboardLoading(true);setDashboardError('');
    const results=await Promise.all([
      supabase.from('contact_messages').select('id',{count:'exact',head:true}),
      supabase.from('contact_messages').select('id',{count:'exact',head:true}).eq('status','Novo'),
      supabase.from('fiti_applications').select('id',{count:'exact',head:true}).neq('type','press'),
      supabase.from('fiti_applications').select('id',{count:'exact',head:true}).neq('type','press').eq('status','Novo'),
      supabase.from('news').select('id',{count:'exact',head:true}),
      supabase.from('media_assets').select('id',{count:'exact',head:true}),
    ]);
    const failed=results.find(result=>result.error);
    if(failed?.error)setDashboardError(`Não foi possível actualizar os indicadores: ${failed.error.message}`);
    setDashboardStats({messages:results[0].count??0,newMessages:results[1].count??0,applications:results[2].count??0,newApplications:results[3].count??0,news:results[4].count??0,media:results[5].count??0});
    setDashboardLoading(false);
  }
  // Os indicadores são recarregados sempre que a sessão é iniciada.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{void loadDashboardStats();},[session]);
  async function handleLogin(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!supabase)return;setLoading(true);setLoginError('');const{error}=await supabase.auth.signInWithPassword({email,password});setLoading(false);if(error)setLoginError('Não foi possível iniciar sessão. Confirme o email, a palavra-passe e o perfil em admin_profiles.');}
  async function handleLogout(){if(!supabase)return;setLoading(true);await supabase.auth.signOut();setLoading(false);setPassword('');}
  const csv=useMemo(()=>`tipo,nome,email,telefone,estado\ncontacto,,,,Novo\ninscricao-fiti,,,,Novo\nimprensa,,,,Novo\n`,[]);
  if(!isSupabaseConfigured)return <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white"><div className="max-w-2xl rounded-3xl border border-sun/20 bg-zinc-950/95 p-8 shadow-2xl shadow-sun/10"><p className="text-sm font-bold uppercase tracking-[.3em] text-sun">/admin</p><h1 className="mt-3 font-display text-4xl text-sun">Área de gestão indisponível</h1><p className="mt-4 text-zinc-300">Área de gestão indisponível. Configure o Supabase para activar o painel administrativo.</p><ol className="mt-6 list-decimal space-y-2 pl-5 text-left text-sm text-zinc-300"><li>Criar projecto no Supabase.</li><li>Executar <code>supabase/schema.sql</code>.</li><li>Executar <code>supabase/seed.sql</code>.</li><li>Criar utilizador em Authentication.</li><li>Inserir o utilizador em <code>admin_profiles</code>.</li><li>Configurar <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li></ol><Link className="mt-6 inline-flex rounded-full bg-sun px-5 py-3 font-bold text-black" href="/">Voltar ao site</Link></div></div>;
  if(!session)return <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white"><form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-sun/20 bg-zinc-950/95 p-8 shadow-2xl shadow-sun/10"><p className="text-sm font-bold uppercase tracking-[.3em] text-sun">CMS Girassol</p><h1 className="mt-3 font-display text-4xl text-white">Entrar no painel</h1><p className="mt-3 text-sm text-zinc-300">Use o email e a palavra-passe criados no Supabase Auth para aceder ao CMS em /admin.</p><label className="mt-6 block text-left text-sm font-semibold text-zinc-200">Email<input className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-sun" type="email" value={email} onChange={event=>setEmail(event.target.value)} autoComplete="email" required /></label><label className="mt-4 block text-left text-sm font-semibold text-zinc-200">Password<input className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-sun" type="password" value={password} onChange={event=>setPassword(event.target.value)} autoComplete="current-password" required /></label>{loginError&&<p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{loginError}</p>}<button className="mt-6 w-full rounded-full bg-sun px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">{loading?'A entrar...':'Entrar no CMS'}</button><Link className="mt-4 inline-flex text-sm text-zinc-400 hover:text-sun" href="/">Voltar ao site público</Link></form></div>;
  const home=adminSections.filter(s=>s.page_slug==='home');const fiti=adminSections.filter(s=>s.page_slug==='fiti');
  const dashboardCards=[
    {label:'Mensagens recebidas',value:dashboardStats.messages,newCount:dashboardStats.newMessages,href:'#Contactos',icon:Mail},
    {label:'Inscrições FITI',value:dashboardStats.applications,newCount:dashboardStats.newApplications,href:'#Inscrições FITI',icon:FileText},
    {label:'Notícias',value:dashboardStats.news,newCount:0,href:'#Notícias',icon:Newspaper},
    {label:'Imagens e ficheiros',value:dashboardStats.media,newCount:0,href:'#Media Library',icon:ImageIcon},
  ];
  return <AdminLayout>
<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
<div><h1 id="Dashboard" className="font-display text-5xl font-black">Painel de Gestão Girassol + FITI</h1><p className="mt-3 text-zinc-300">CMS completo para editar páginas, secções, menus, SEO, aparência, media, formulários e conteúdos específicos sem alterar código.</p></div>
<div className="flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-zinc-950 p-4 text-sm lg:items-end"><span className="inline-flex items-center gap-2 text-emerald-300"><Database size={16}/> Supabase ligado</span><span className="max-w-xs truncate text-zinc-400" title={sessionEmail}>{sessionEmail||'Utilizador autenticado'}</span><button type="button" onClick={handleLogout} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-3 py-2 text-red-100 hover:border-red-400 disabled:opacity-60"><LogOut size={16}/> Sair do CMS</button></div>
</div>
<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{dashboardCards.map(({label,value,newCount,href,icon:Icon})=>
<a href={href} className="group rounded-3xl border border-white/10 bg-zinc-950 p-5 transition hover:-translate-y-0.5 hover:border-sun/50" key={label}><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-zinc-400">{label}</p><b className="mt-2 block text-4xl text-white">{dashboardLoading?'—':value}</b></div><span className="rounded-2xl bg-sun/10 p-3 text-sun"><Icon size={22}/></span></div><p className="mt-3 text-sm text-sun">{newCount>0?`${newCount} novo${newCount===1?'':'s'} · Abrir área`:'Abrir área'}</p></a>)}</div>
{dashboardError&&<p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{dashboardError}</p>}
<div className="mt-5 flex flex-wrap gap-3">
<Link className="rounded-full bg-sun px-5 py-3 font-bold text-black" href="/">Ver site</Link>
<a className="rounded-full border border-white/10 px-5 py-3" href="#Homepage">Editar homepage</a>
<a className="rounded-full border border-white/10 px-5 py-3" href="#FITI">Editar FITI</a>
<button type="button" onClick={loadDashboardStats} disabled={dashboardLoading} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 disabled:opacity-60"><RefreshCw size={17} className={dashboardLoading?'animate-spin':''}/> Actualizar indicadores</button>
</div>
<div className="my-10 flex items-center gap-4" aria-label="Início da gestão de conteúdo">
<div className="h-px flex-1 bg-gradient-to-r from-transparent via-sun/70 to-sun/20"/>
<div className="flex shrink-0 items-center gap-3 rounded-full border border-sun/30 bg-sun/10 px-4 py-2">
<span className="h-2 w-2 rounded-full bg-sun shadow-[0_0_14px_rgba(255,190,0,0.9)]"/>
<span className="text-xs font-bold uppercase tracking-[0.22em] text-sun">Gestão de conteúdo</span>
</div>
<div className="h-px flex-1 bg-gradient-to-l from-transparent via-sun/70 to-sun/20"/>
</div>
<section id="Páginas" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<span id="SEO" className="scroll-mt-8"/>
<h2 className="font-display text-3xl text-sun">Páginas e SEO</h2>
<p className="mt-2 text-zinc-300">Seleccione a Homepage ou o FITI para actualizar a identificação usada no site, nos motores de pesquisa e nas partilhas.</p>
<div className="mt-4 rounded-2xl border border-sun/20 bg-sun/5 p-4 text-sm text-zinc-300"><b className="text-sun">Área protegida:</b> os identificadores <code>home</code> e <code>fiti</code> não podem ser alterados ou apagados. Para usar uma imagem de partilha, carregue primeiro o ficheiro na <a href="#Media Library" className="font-semibold text-sun underline decoration-sun/40 underline-offset-4">Media Library</a> e cole aqui o URL público.</div>
<CollectionManager title="Páginas e SEO" table="pages" previewPathKey="slug" editableKeys={['title','seo_title','seo_description','share_image_url','is_published']} fields={[{key:'slug',label:'Identificador da página (protegido)'},{key:'title',label:'Nome da página'},{key:'seo_title',label:'Título para Google e partilhas'},{key:'seo_description',label:'Descrição para Google e partilhas',type:'textarea'},{key:'share_image_url',label:'URL da imagem de partilha',type:'url'},{key:'is_published',label:'Estado da página',type:'boolean'}]} fallbackRows={[{slug:'home',title:'Associação Cultural Girassol',seo_title:'Associação Cultural Girassol',seo_description:'Teatro, cultura e juventude em Moçambique.',share_image_url:'',is_published:true},{slug:'fiti',title:'FITI',seo_title:'FITI – Festival Internacional Teatro de Inverno',seo_description:'Festival internacional da Associação Cultural Girassol.',share_image_url:'',is_published:true}]} />
</section>
<section id="Homepage" className="mt-10 space-y-5">
<div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-3xl text-sun">Homepage</h2><p className="mt-1 text-sm text-zinc-400">Edite as secções que formam a página principal, apresentadas abaixo pela ordem em que aparecem no site.</p></div><span className="rounded-full border border-sun/20 bg-sun/10 px-4 py-2 text-xs font-bold text-sun">{home.length} secções</span></div>
{home.map((s,index)=><div key={s.id} className="relative"><span className="absolute -left-3 top-5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-sun/40 bg-black text-xs font-bold text-sun">{index+1}</span><SectionEditor section={s} fields={adminFields[s.section_key] ?? []}/></div>)}
<div className="flex items-center gap-4 py-5" aria-label="Fim da Homepage"><div className="h-px flex-1 bg-gradient-to-r from-transparent to-sun/40"/><span className="rounded-full border border-sun/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sun">Fim da Homepage</span><div className="h-px flex-1 bg-gradient-to-l from-transparent to-sun/40"/></div>
</section>
<section id="FITI" className="mt-10 space-y-5">
<h2 className="font-display text-3xl text-sun">FITI</h2>{fiti.map(s=>
<SectionEditor key={s.id} section={s} fields={adminFields[s.section_key] ?? []}/>)}</section>
<section id="Identidade Visual" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<h2 className="font-display text-3xl text-sun">Identidade Visual</h2>
<p className="mt-2 text-zinc-300">Faça upload na Media Library, seleccione uma imagem e guarde em theme_settings. Os fallbacks CSS/SVG continuam activos quando os URLs estiverem vazios ou falharem.</p>
<div className="mt-5 space-y-6">{visualIdentitySections.map(section=>
<div key={section.title}>
<h3 className="mb-3 text-xl font-bold text-white">{section.title}</h3>
<div className="grid gap-4 md:grid-cols-2">{section.fields.map(([key,label,description,type])=>
<VisualIdentityField key={key} settingKey={key} label={label} description={description} type={type} defaultValue={themeValues[key] ?? String(cmsFallbackTheme[key as keyof typeof cmsFallbackTheme] ?? '')} onSave={async (key,value)=>{await saveThemeSetting(key,value);setThemeValues(current=>({...current,[key]:value}));}}/>)}</div>
</div>)}</div>
</section>
<section id="Aparência" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<h2 className="font-display text-3xl text-sun">Aparência e contactos públicos</h2>
<div className="mt-4 grid gap-4 md:grid-cols-3">{themeKeys.map((k,i)=>{const v=cmsFallbackTheme[k];return <EditableField key={k} onChange={(value)=>saveThemeSetting(k,value).catch(()=>undefined)} field={{id:k,section_id:'theme',field_key:k,field_label:themeLabels[k] ?? k,field_type:typeof v==='boolean'?'boolean':typeof v==='number'?'number':k.includes('color')||k.includes('gradient')?'color':selectKeys.has(k)?'select':'text',field_value:themeValues[k] ?? String(v ?? ''),order_index:i}}/>})}</div>
</section>
<SupabaseDiagnostics/>
<section id="Media Library" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<h2 className="font-display text-3xl text-sun">Media Library</h2>
<p className="mt-2 text-zinc-300">Carregue logotipos, imagens, vídeos e PDFs para o bucket público site-media do Supabase Storage.</p>
<div className="mt-5">
<MediaLibrary />
</div>
</section>{managers.map((manager)=>
<section id={manager.area} key={manager.area} className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<h2 className="font-display text-3xl text-sun">{manager.area}</h2>
<p className="mt-2 text-zinc-300">Listagem, criação, edição, activação/desactivação e remoção ligadas ao Supabase, com dados institucionais de fallback quando a tabela estiver vazia.</p>
<CollectionManager title={manager.area} table={manager.table} fields={manager.fields} fallbackRows={manager.fallbackRows as unknown as Row[]} />
</section>)}<section id="Imprensa" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<h2 className="font-display text-3xl text-sun">Pedidos de imprensa</h2>
<p className="mt-2 text-zinc-300">Pedidos de credenciamento submetidos no formulário FITI. Os dados pessoais são apenas para consulta; pode actualizar o Estado.</p>
<CollectionManager title="Imprensa" table="fiti_applications" filters={{type:'press'}} editableKeys={['status']} fields={[{key:'contact_person',label:'Pessoa de contacto'},{key:'email',label:'Email'},{key:'phone',label:'Telefone'},{key:'company_name',label:'Órgão/entidade'},{key:'notes',label:'Observações',type:'textarea'},{key:'status',label:'Estado'}]} fallbackRows={[{contact_person:'Sem pedidos',email:'',phone:'',company_name:'',notes:'Os pedidos de imprensa aparecerão aqui.',status:'Novo'}]} />
</section>
<section id="Contactos" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<h2 className="font-display text-3xl text-sun">Contactos</h2>
<p className="mt-2 text-zinc-300">Mensagens enviadas pelo formulário de contacto. Os dados pessoais são apenas para consulta; pode actualizar o Estado.</p>
<CollectionManager title="Contactos" table="contact_messages" filters={{type:'contacto'}} editableKeys={['status']} fields={[{key:'name',label:'Nome'},{key:'email',label:'Email'},{key:'phone',label:'Telefone'},{key:'subject',label:'Assunto'},{key:'message',label:'Mensagem',type:'textarea'},{key:'status',label:'Estado'}]} fallbackRows={[{name:'Sem mensagens',email:'',phone:'',subject:'',message:'As mensagens aparecerão aqui após submissão dos formulários.',status:'Novo'}]} />
</section>
<section id="Definições" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<h2 className="font-display text-3xl text-sun">Definições</h2>
<p className="mt-2 text-zinc-300">Supabase configurado, static export activo, GitHub Pages preparado e fallbacks públicos disponíveis.</p>
</section>
<section id="Formulários" className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-5">
<h2 className="font-display text-3xl text-sun">Formulários</h2>
<p className="text-zinc-300">Mensagens, inscrições, voluntariado, imprensa e pedidos de informação com estados Novo, Em análise, Respondido e Arquivado.</p>
<a download="girassol-formularios.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-sun px-5 py-3 font-bold text-black">
<Download size={18}/> Exportar CSV</a>
</section>
</AdminLayout>
}
