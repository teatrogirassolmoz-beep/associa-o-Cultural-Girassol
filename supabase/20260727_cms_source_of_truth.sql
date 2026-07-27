-- Associação Cultural Girassol — CMS como fonte única de conteúdo
-- Executar no SQL Editor do Supabase antes de publicar o código.

alter table public.admin_profiles drop constraint if exists admin_profiles_role_check;
alter table public.admin_profiles add constraint admin_profiles_role_check check(role in ('admin','editor'));

create or replace function public.can_manage_content(user_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(
  select 1 from public.admin_profiles
  where id=user_id and role in ('admin','editor') and coalesce(is_active,true)
 )
$$;
create or replace function public.can_manage_content()
returns boolean language sql stable security definer set search_path=public as $$
 select public.can_manage_content(auth.uid())
$$;

alter table public.projects add column if not exists order_index integer default 0;
alter table public.gallery add column if not exists order_index integer default 0;
alter table public.partners add column if not exists order_index integer default 0;
alter table public.fiti_companies add column if not exists order_index integer default 0;

do $$ declare t text; begin
 foreach t in array array[
  'pages','page_sections','section_fields','theme_settings','media_assets','navigation_items','social_links',
  'timeline','projects','impact_stats','gallery','news','partners','fiti_editions','fiti_program',
  'fiti_companies','fiti_workshops','fiti_archive','contact_messages','fiti_applications','content_revisions'
 ] loop
  execute format('drop policy if exists "Admin manage %I" on public.%I',t,t);
  execute format('drop policy if exists "Content managers manage %I" on public.%I',t,t);
  execute format('create policy "Content managers manage %I" on public.%I for all to authenticated using(public.can_manage_content()) with check(public.can_manage_content())',t,t);
 end loop;
end $$;

drop policy if exists "Admins manage site media" on storage.objects;
drop policy if exists "Admins upload site media" on storage.objects;
drop policy if exists "Admins update site media" on storage.objects;
drop policy if exists "Admins delete site media" on storage.objects;
drop policy if exists "Content managers manage site media" on storage.objects;
create policy "Content managers manage site media" on storage.objects for all to authenticated
 using(bucket_id='site-media' and public.can_manage_content())
 with check(bucket_id='site-media' and public.can_manage_content());

update public.page_sections set section_name=case section_key
 when 'home_hero' then 'Destaque principal'
 when 'home_about' then 'Quem somos'
 when 'home_mission_vision' then 'Missão, visão e valores'
 when 'home_timeline' then 'História'
 when 'home_what_we_do' then 'O que fazemos'
 when 'home_projects' then 'Projectos'
 when 'home_impact' then 'Impacto'
 when 'home_gallery' then 'Galeria'
 when 'home_news' then 'Notícias'
 when 'home_partners' then 'Parceiros'
 when 'home_contact' then 'Contactos'
 when 'fiti_hero' then 'Destaque FITI'
 when 'fiti_about' then 'Sobre o FITI'
 when 'fiti_current_edition' then 'Edição actual'
 when 'fiti_program' then 'Programação FITI'
 when 'fiti_companies' then 'Companhias FITI'
 when 'fiti_workshops' then 'Oficinas FITI'
 when 'fiti_tickets' then 'Bilhetes e reservas'
 when 'fiti_archive' then 'Arquivo FITI'
 when 'fiti_partners' then 'Parceiros FITI'
 when 'fiti_press' then 'Imprensa FITI'
 when 'fiti_contact' then 'Contactos FITI'
 else section_name end;

insert into public.page_sections(page_slug,section_key,section_name,section_type,order_index,is_active,settings)
select 'fiti','fiti_forms','Inscrições e pedidos FITI','forms',12,true,'{"editable":true}'::jsonb
where not exists(select 1 from public.page_sections where section_key='fiti_forms');

with values_to_seed(section_key,field_key,field_label,field_type,field_value,field_json,order_index) as (values
 ('home_about','eyebrow','Chamada','text','Quem Somos',null::jsonb,1),
 ('home_about','section_title','Título','text','Uma casa para criação, formação e encontro',null,2),
 ('home_about','section_text','Texto institucional','textarea','A Associação Cultural Girassol é uma organização cultural juvenil moçambicana dedicada à promoção do teatro, da formação artística, do intercâmbio cultural e da participação comunitária.\nCriada a partir do Grupo de Teatro Girassol, nascido em 1987, a Associação construiu uma trajectória marcada pela formação de actores, produção de espectáculos, circulação artística, acções sociais e apoio a grupos culturais emergentes.\nAo longo dos anos, o Girassol afirmou-se como um espaço de criação, aprendizagem e encontro entre artistas, jovens, comunidades e instituições culturais.',null,3),
 ('home_about','image_caption','Legenda do logotipo','text','Marca institucional da Associação Cultural Girassol',null,4),
 ('home_mission_vision','mission','Missão','textarea','Promover o teatro e as artes cénicas como instrumentos de educação, participação juvenil, intercâmbio cultural, inclusão social e desenvolvimento comunitário.',null,1),
 ('home_mission_vision','vision','Visão','textarea','Ser uma referência nacional e internacional na promoção do teatro, da formação artística e da circulação cultural.',null,2),
 ('home_mission_vision','values','Valores, um por linha','textarea','Criatividade\nInclusão\nJuventude\nMemória\nIntercâmbio\nCidadania\nProfissionalismo\nTransformação social',null,3),
 ('home_timeline','eyebrow','Chamada','text','História',null,1),('home_timeline','section_title','Título','text','Linha do tempo',null,2),
 ('home_what_we_do','eyebrow','Chamada','text','O que fazemos',null,1),('home_what_we_do','section_title','Título','text','Arte com impacto social',null,2),
 ('home_what_we_do','cards','Áreas de actuação (JSON)','json','', '[{"title":"Teatro","description":"Produção e promoção de espectáculos teatrais."},{"title":"Formação artística","description":"Oficinas e acções formativas para criadores."},{"title":"Intercâmbio cultural","description":"Encontros nacionais e internacionais."},{"title":"Festivais","description":"Plataformas de circulação e diálogo artístico."},{"title":"Acção social","description":"Cultura, educação e transformação comunitária."}]'::jsonb,3),
 ('home_projects','eyebrow','Chamada','text','Projectos',null,1),('home_projects','section_title','Título','text','Programas estruturantes',null,2),
 ('home_impact','eyebrow','Chamada','text','Impacto',null,1),('home_impact','section_title','Título','text','Indicadores institucionais',null,2),
 ('home_gallery','eyebrow','Chamada','text','Galeria',null,1),('home_gallery','section_title','Título','text','Memória visual',null,2),
 ('home_news','eyebrow','Chamada','text','Notícias',null,1),('home_news','section_title','Título','text','Actualizações',null,2),
 ('home_partners','eyebrow','Chamada','text','Parceiros',null,1),('home_partners','section_title','Título','text','Rede de apoio',null,2),
 ('home_contact','eyebrow','Chamada','text','Contacto',null,1),('home_contact','section_title','Título','text','Fale com a Associação',null,2),
 ('fiti_about','eyebrow','Chamada','text','Sobre o FITI',null,1),('fiti_about','section_title','Título','text','Festival, encontro e circulação',null,2),
 ('fiti_about','section_text','Descrição','textarea','O FITI – Festival Internacional Teatro de Inverno é o principal projecto da Associação Cultural Girassol. Nascido como Teatro d’Inverno, tornou-se uma plataforma de circulação, formação e intercâmbio artístico.',null,3),
 ('fiti_current_edition','eyebrow','Chamada','text','Edição actual',null,1),('fiti_current_edition','section_title','Título da secção','text','Edição actual',null,2),
 ('fiti_program','eyebrow','Chamada','text','Programação',null,1),('fiti_program','section_title','Título','text','Programação FITI',null,2),('fiti_program','empty_state_text','Mensagem sem programação','textarea','Programação em actualização.',null,3),
 ('fiti_companies','eyebrow','Chamada','text','Companhias',null,1),('fiti_companies','section_title','Título','text','Artistas e grupos',null,2),
 ('fiti_workshops','eyebrow','Chamada','text','Oficinas',null,1),('fiti_workshops','section_title','Título','text','Masterclasses e formação',null,2),
 ('fiti_tickets','eyebrow','Chamada','text','Bilhetes e reservas',null,1),('fiti_tickets','section_title','Título','text','Acesso aos espectáculos',null,2),
 ('fiti_tickets','section_text','Informação','textarea','Consulte as informações de acesso aos espectáculos e actividades do FITI.',null,3),
 ('fiti_tickets','primary_button_text','Botão principal','text','Reservar lugar',null,4),('fiti_tickets','primary_button_link','Link principal','url','#formularios',null,5),
 ('fiti_tickets','secondary_button_text','Segundo botão','text','Falar com a organização',null,6),('fiti_tickets','secondary_button_link','Segundo link','url','#contacto',null,7),
 ('fiti_archive','eyebrow','Chamada','text','Arquivo FITI',null,1),('fiti_archive','section_title','Título','text','Edições anteriores',null,2),
 ('fiti_partners','eyebrow','Chamada','text','Parceiros',null,1),('fiti_partners','section_title','Título','text','Rede de apoio',null,2),
 ('fiti_press','eyebrow','Chamada','text','Imprensa',null,1),('fiti_press','section_title','Título','text','Imprensa',null,2),
 ('fiti_press','section_text','Descrição','textarea','Informações oficiais, materiais de divulgação e contactos de imprensa.',null,3),
 ('fiti_forms','eyebrow','Chamada','text','Formulários FITI',null,1),('fiti_forms','section_title','Título','text','Inscrições e pedidos',null,2),
 ('fiti_forms','company_option','Opção companhia','text','Inscrição de companhia',null,3),('fiti_forms','volunteer_option','Opção voluntariado','text','Voluntariado',null,4),
 ('fiti_forms','press_option','Opção imprensa','text','Credenciamento de imprensa',null,5),('fiti_forms','info_option','Opção informação','text','Pedido de informações',null,6)
)
insert into public.section_fields(section_id,field_key,field_label,field_type,field_value,field_json,order_index)
select s.id,v.field_key,v.field_label,v.field_type,v.field_value,v.field_json,v.order_index
from values_to_seed v join public.page_sections s on s.section_key=v.section_key
on conflict(section_id,field_key) do update set
 field_label=excluded.field_label,field_type=excluded.field_type,order_index=excluded.order_index,
 field_value=case when coalesce(trim(section_fields.field_value),'')='' or section_fields.field_value like 'Conteúdo em actualização.%' then excluded.field_value else section_fields.field_value end,
 field_json=case when section_fields.field_json is null or section_fields.field_json='{}'::jsonb then excluded.field_json else section_fields.field_json end;

grant execute on function public.can_manage_content(uuid) to authenticated;
grant execute on function public.can_manage_content() to authenticated;
