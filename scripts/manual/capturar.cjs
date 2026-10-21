/* Capturas locais para o manual. Requer Next dev em 3003 com as variáveis
   NEXT_PUBLIC_SUPABASE_URL=https://girassol-fixture.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=fixture-anon-key
   Não usa contas reais e recusa todas as gravações. Requer Playwright e Chromium. */
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../..'),data=require(root+'/lib/data.ts'),parts=require('./partes.json');
const out=root+'/public/manual/imagens/guia';fs.mkdirSync(out,{recursive:true});
const base='http://127.0.0.1:3003';
const badge=(title,color)=>base+'/manual-demo/arte.svg?title='+encodeURIComponent(title)+'&color='+encodeURIComponent(color);
const art=badge('ARTE EM CENA','#ffac62'),logo=badge('APOIO','#7bd6b0');
const rows=(items)=>items.map((r,i)=>({id:'demo-'+i,is_active:true,order_index:i+1,...r}));
const edition={id:'edition-demo',year:2026,theme:'Encontros em cena — demonstração',dates:'20 a 22 de Novembro — exemplo',locations:'Maputo — exemplo',countries:'Moçambique',description:'Conteúdo de demonstração para explicar a gestão de uma edição.',curatorial_text:'Texto curatorial de exemplo, sem anúncio oficial.',poster_url:art,active:true};
const tables={
 page_sections:data.cmsFallbackSections.map(s=>({...s,fields:data.cmsFallbackFields[s.section_key]||[]})),
 section_fields:Object.values(data.cmsFallbackFields).flat(),pages:data.cmsFallbackPages,
 navigation_items:data.cmsFallbackNavigation,
 theme_settings:Object.entries({...data.cmsFallbackTheme,contact_email:'equipa@example.test',contact_location:'Maputo — exemplo',member_profiles:JSON.stringify([{name:'Perfil de demonstração',role:'Função na Associação',group:'associacao',bio:'Exemplo de biografia; não representa uma pessoa real.',photo:''},{name:'Equipa FITI — exemplo',role:'Função no festival',group:'fiti',bio:'Exemplo de perfil para o manual.',photo:''}]),announcement_items:JSON.stringify([{label:'FITI · Conheça as modalidades de candidatura',href:'/fiti#formularios'},{label:'Explore o calendário do FITI',href:'/fiti#programacao'}])}).map(([key,value])=>({key,value:String(value)})),
 timeline:rows(data.timeline),projects:rows(data.projects),impact_stats:rows([{label:'Indicador de demonstração',value:0,suffix:'',}]),
 gallery:rows([{title:'Cartaz de demonstração',category:'Teatro',description:'Composição ilustrativa para explicar a galeria.',image_url:art,alt_text:'Cartaz artístico de demonstração'}]),
 news:rows([{title:'Notícia de demonstração',slug:'noticia-demonstracao',summary:'Exemplo para explicar título, resumo, fotografia e publicação.',content:'Conteúdo ilustrativo do manual.',image_url:art,category:'Cultura',published:true,created_at:'2026-10-21T12:00:00Z'}]),
 partners:rows([{name:'Parceiro de demonstração A',category:'Apoio',logo_url:logo,show_on_home:true,show_on_fiti:true,link:'https://example.org'},{name:'Parceiro de demonstração B',category:'Apoio',logo_url:art,show_on_home:true,show_on_fiti:true,link:'https://example.org'}]),
 fiti_editions:[edition],
 fiti_program:rows([{edition_id:edition.id,title:'Encontro de teatro — demonstração',date:'2026-11-20',time:'19:30',company:'Companhia de demonstração',country:'Moçambique',venue:'Espaço cultural — exemplo',category:'Teatro',synopsis:'Sinopse ilustrativa para aprender a preencher um evento.',duration:'90 min',age_rating:'Livre',image_url:art}]),
 fiti_workshops:rows([{edition_id:edition.id,title:'Oficina de demonstração',trainer:'Formador de exemplo',date:'2026-11-21',time:'14:00',venue:'Espaço cultural — exemplo',vacancies:20,target_audience:'Público de exemplo',description:'Descrição ilustrativa de uma oficina.'}]),
 fiti_companies:rows([{edition_id:edition.id,name:'Companhia de demonstração',country:'Moçambique',city:'Maputo',description:'Exemplo de apresentação de uma companhia.',image_url:art,show_title:'Encontro de teatro — demonstração'}]),
 fiti_archive:rows([{year:2025,theme:'Arquivo de demonstração',dates:'Datas de exemplo',description:'Exemplo de memória de uma edição anterior.',poster_url:art,program_pdf_url:'/manual/manual-utilizacao-cms.pdf'}]),
 fiti_applications:rows([{type:'company',company_name:'Candidatura de demonstração',country:'Moçambique',city:'Maputo',contact_person:'Contacto fictício',email:'exemplo@example.test',phone:'',show_title:'Espectáculo de exemplo',synopsis:'Dados fictícios para explicar a leitura de candidaturas.',status:'Novo'}]),
 social_links:rows([{platform:'Instagram',label:'Instagram de exemplo',url:'https://example.org'}]),media_assets:[],contact_messages:[]
};
async function main(){const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const c=await b.newContext({locale:'pt-PT',viewport:{width:1440,height:760},reducedMotion:'reduce'});
await c.route('**/manual-demo/**',r=>{const u=new URL(r.request().url()),color=u.searchParams.get('color'),title=u.searchParams.get('title');return r.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420"><rect width="600" height="420" fill="${color}"/><circle cx="300" cy="170" r="95" fill="#ffda32"/><path d="M180 330Q300 70 420 330" stroke="#54235e" fill="none" stroke-width="24"/><text x="300" y="390" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#54235e">${title} · DEMONSTRAÇÃO</text></svg>`})});
await c.route(/https:\/\/[^/]*supabase\.co\/.*/,async r=>{const req=r.request(),u=new URL(req.url());if(u.hostname!=='girassol-fixture.supabase.co')throw Error('O servidor não utiliza a configuração de demonstração');if(req.method()!=='GET'&&req.method()!=='HEAD'&&req.method()!=='OPTIONS')return r.fulfill({status:403,json:{message:'Gravação desactivada no manual'}});
let result=tables[u.pathname.split('/').pop()]||[];
for(const [key,value] of u.searchParams){if(['select','order','limit','offset'].includes(key))continue;if(value.startsWith('eq.'))result=result.filter(x=>String(x[key])===value.slice(3));if(value.startsWith('neq.'))result=result.filter(x=>String(x[key])!==value.slice(4));}
if(u.searchParams.get('select')==='id')result=result.map(({id})=>({id}));
if(req.headers().accept?.includes('object+json'))result=result[0]||null;
await r.fulfill({status:200,json:result,headers:{'content-range':`0-0/${Array.isArray(result)?result.length:1}`}});});
await c.addInitScript(()=>localStorage.setItem('sb-girassol-fixture-auth-token',JSON.stringify({access_token:'demo-token',refresh_token:'demo-refresh',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'demo-user',email:'equipa@example.test',aud:'authenticated',role:'authenticated'}})));
const pub=await c.newPage(),cms=await c.newPage();
await cms.goto(base+'/admin/');await cms.getByText('Painel de Gestão Girassol + FITI',{exact:true}).waitFor();
async function settle(p){await p.waitForTimeout(300);await p.evaluate(()=>document.fonts.ready);}
async function mark(p,label,target){await p.locator('#manual-capture-label').evaluateAll(es=>es.forEach(e=>e.remove()));await p.evaluate(label=>{const d=document.createElement('div');d.id='manual-capture-label';d.textContent=label;Object.assign(d.style,{position:'fixed',top:'0',left:'0',right:'0',padding:'10px 20px',background:'#54235e',color:'#fff5ce',font:'bold 14px system-ui',zIndex:'2147483647',boxShadow:'0 2px 10px #0003'});document.body.append(d)},label);if(target)await target.evaluate(e=>{e.style.outline='3px solid #d72c89';e.style.outlineOffset='4px'});}
async function position(p,target,offset=0){await target.waitFor({state:'visible'});await target.evaluate((e,offset)=>{const y=e.getBoundingClientRect().top+window.scrollY-105+offset;window.scrollTo({top:y,behavior:'instant'})},offset);await settle(p);}
async function captureCMS(spec,file,label){await cms.goto(base+'/admin/#'+encodeURIComponent(spec.area));await settle(cms);let target=cms.locator(`[id=${JSON.stringify(spec.area)}]`).last();
if(spec.section)target=target.locator(`section[id=${JSON.stringify(spec.section)}]`);
if(spec.group)target=target.locator('section').filter({has:cms.getByRole('heading',{name:spec.group,exact:true})}).last();
if(spec.field){const input=target.locator(`[name=${JSON.stringify(spec.field)}]`);if(await input.count())target=input.locator('xpath=..');else if(spec.field==='calendar_view')target=target.getByLabel('Vista inicial',{exact:true}).locator('xpath=..');else throw Error('Campo inexistente '+spec.field);}
if(spec.fieldLabel)target=target.locator('label').filter({hasText:new RegExp('^'+spec.fieldLabel)}).first();
await position(cms,target);await mark(cms,label,target);await cms.screenshot({path:file});}
const only=process.env.MANUAL_PARTS?.split(',').map(Number);
for(let i=0;i<parts.length;i++){const n=i+1;if(only&&!only.includes(n))continue;const part=parts[i],prefix=String(n).padStart(2,'0');
if(!process.env.MANUAL_EXTRAS_ONLY){await pub.goto(base+(part.route||'/'));await settle(pub);if(part.openMenu)await pub.getByRole('button',{name:'Menu',exact:true}).click();if(part.openNotices)await pub.getByRole('button',{name:'Ver todos os avisos',exact:true}).click();
const site=pub.locator(part.site).first();if(!part.openMenu&&!part.openNotices)await position(pub,site,part.offset||0);
// Registar o estado final dos cartões, depois das animações de entrada.
await site.locator('.backdrop-blur[style]').evaluateAll(es=>es.forEach(e=>{e.style.opacity='1';e.style.transform='none';}));
await site.locator('img').evaluateAll(es=>Promise.all(es.map(e=>{e.loading='eager';return e.decode().catch(()=>{});})));await pub.waitForTimeout(150);
await mark(pub,`${prefix} · NO SITE · ${part.title} · Demonstração`,site);if([3,5].includes(n))await pub.locator('#manual-capture-label').evaluate(e=>{e.style.top='auto';e.style.bottom='0';});await pub.screenshot({path:`${out}/${prefix}-site.png`});
if(!process.env.MANUAL_SITE_ONLY)await captureCMS(part,`${out}/${prefix}-cms.png`,`${prefix} · ONDE ALTERAR · ${part.path} · Demonstração`);}
for(let j=0;!process.env.MANUAL_SITE_ONLY&&j<(part.extra||[]).length;j++){const spec=part.extra[j];await captureCMS(spec,`${out}/${prefix}-cms-${j+3}.png`,`${prefix} · TAMBÉM AQUI · ${spec.path} · Demonstração`);}
console.log(`PASS ${prefix} ${part.title}`);
}
await b.close();}
main().catch(e=>{console.error(e);process.exit(1)});
