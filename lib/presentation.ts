export type PresentationField = { key: string; label: string; group: string; value: string; type: 'text'|'color'|'boolean'|'number'|'select'; options?: [string,string][]; min?: number; max?: number };
const palettes = {
 home: ['#ffda32','#ffd83e','#ffac62','#7bd6b0','#ffc65c','#ffd53a','#ffd65a','#44202b','#a51c63','#e95f21'],
 fiti: ['#ff9869','#ffaf70','#ffd33e','#f69eb3','#ffb75c','#ffb277','#ffbc88','#532246','#a51c63','#b32985'],
};
export const presentationFields: PresentationField[] = [];
for (const [page, colors] of Object.entries(palettes)) {
 const names=['Fundo da abertura','Fundo das secções 1','Fundo das secções 2','Fundo das secções 3','Fundo dos cartões','Fundo do menu','Fundo do rodapé','Texto','Destaque e botões','Pinceladas interactivas'];
 const keys=['hero','section_1','section_2','section_3','panel','nav','footer','ink','accent','brush'];
 keys.forEach((key,i)=>presentationFields.push({key:`${page}_${key}_color`,label:names[i],group:page==='home'?'Cores da Associação':'Cores do FITI',value:colors[i],type:'color'}));
}
const field=(key:string,label:string,group:string,value:string,type:PresentationField['type']='text',extra:Partial<PresentationField>={}):PresentationField=>({key,label,group,value,type,...extra});
presentationFields.push(
 field('animated_background_enabled','Movimento e pigmentos do fundo','Movimento','true','boolean'),
 field('cursor_interaction_enabled','Interacção do rato e toque em todo o site','Movimento','true','boolean'),
 field('cursor_strength','Intensidade das pinceladas','Movimento','1','number',{min:.2,max:2}),
 field('interaction_hint','Mensagem de interacção','Movimento','Mova o rato ou toque — dê cor ao palco.'),
 field('map_enabled','Mostrar o mapa de Moçambique','Elementos culturais','true','boolean'),
 field('fiti_spotlight_enabled','Mostrar destaque FITI na página inicial','Elementos culturais','true','boolean'),
 field('fiti_menu_highlight','Destacar o FITI no menu','Menus','true','boolean'),
 field('home_brand_label','Nome da Associação no menu','Menus','GIRASSOL'),
 field('home_brand_subtitle','Subtítulo da Associação no menu','Menus','ASSOCIAÇÃO CULTURAL'),
 field('fiti_brand_label','Nome do FITI no menu','Menus','FITI'),
 field('fiti_brand_subtitle','Subtítulo do FITI no menu','Menus','TEATRO EM MOÇAMBIQUE'),
 field('home_nav_cta','Botão de destaque da Associação','Menus','Entrar no FITI'),
 field('home_nav_cta_link','Destino do botão da Associação','Menus','/fiti'),
 field('fiti_nav_cta','Botão de destaque do FITI','Menus','Inscrições'),
 field('fiti_nav_cta_link','Destino do botão do FITI','Menus','/fiti#formularios'),
 field('association_return_label','Botão de regresso à Associação','Menus','← Associação Girassol'),
 field('menu_title','Título do menu completo','Menus','Há muito para descobrir.'),
 field('menu_home_title','Grupo da Associação','Menus','A Associação'),
 field('menu_fiti_title','Grupo do FITI','Menus','Universo FITI'),
 field('menu_footer_title','Grupo de atalhos','Menus','Faça parte'),
 field('menu_signature','Assinatura do menu','Menus','Teatro. Juventude. Memória. Movimento.'),
 field('partners_placement','Posição da faixa de parceiros','Parceiros','end','select',{options:[['end','No fim do conteúdo'],['section','Na ordem definida nas secções'],['before_contact','Antes dos contactos']]}),
 field('partners_motion_enabled','Movimento dos logótipos','Parceiros','true','boolean'),
 field('partners_duration','Segundos por volta dos parceiros','Parceiros','36','number',{min:10,max:120}),
 field('partners_empty_text','Mensagem sem parceiros publicados','Parceiros','Os parceiros e apoios serão anunciados aqui.'),
 field('footer_links_title','Título dos atalhos do rodapé','Rodapé','Ligações rápidas'),
 field('footer_contact_title','Título dos contactos do rodapé','Rodapé','Contactos'),
 field('footer_copyright','Nota de direitos do rodapé','Rodapé','© 2026 Associação Cultural Girassol. Todos os direitos reservados.'),
 field('members_eyebrow','Chamada dos membros','Pessoas','O NOSSO COLECTIVO'),
 field('members_title','Título dos membros','Pessoas','O palco começa nas pessoas.'),
 field('members_intro','Apresentação dos membros','Pessoas','As vozes, os rostos e as histórias de quem constrói a Associação Cultural Girassol e dá vida ao FITI.'),
 field('members_empty_title','Título sem perfis publicados','Pessoas','Uma comunidade em cena'),
 field('members_empty_text','Mensagem sem perfis publicados','Pessoas','Os perfis dos membros da Associação e da equipa FITI estão em preparação. Em breve, conheça os seus rostos e percursos.'),
 field('members_empty_art','Texto artístico sem perfis','Pessoas','JUNTOS, FAZEMOS ACONTECER.'),
 field('members_contact_label','Texto do contacto dos membros','Pessoas','Fale com a organização'),
 field('members_contact_link','Destino do contacto dos membros','Pessoas','#contacto'),
 field('notices_mode','Apresentação dos avisos','Avisos','floating','select',{options:[['floating','Peça flutuante'],['bar','Faixa na base do ecrã'],['hidden','Ocultar']]}),
 field('notices_motion_enabled','Movimento dos avisos','Avisos','true','boolean'),
 field('notices_duration','Segundos por volta dos avisos','Avisos','40','number',{min:10,max:120}),
 field('notices_label','Etiqueta dos avisos','Avisos','EM CENA'),
 field('notices_heading','Chamada da lista de avisos','Avisos','O QUE ESTÁ EM CENA'),
 field('notices_title','Título da lista de avisos','Avisos','Há sempre algo a acontecer.'),
);
export const presentationDefaults: Record<string,string> = Object.fromEntries(presentationFields.map(f=>[f.key,f.value]));
export function resolvePresentation(settings: Record<string,unknown>) {
 const result={...presentationDefaults};
 for(const field of presentationFields){
  const raw=settings[field.key]; if(raw===undefined||raw===null)continue;
  const value=String(raw).trim();
  if(field.type==='color') {if(/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) result[field.key]=value;}
  else if(field.type==='boolean') {if(['true','false','1','0'].includes(value))result[field.key]=String(value==='true'||value==='1');}
  else if(field.type==='number') {const n=Number(value);if(value&&Number.isFinite(n))result[field.key]=String(Math.min(field.max??Infinity,Math.max(field.min??-Infinity,n)));}
  else if(field.type==='select'){if(field.options?.some(([key])=>key===value))result[field.key]=value;}
  else result[field.key]=value.slice(0,1000);
 }
 return result;
}
