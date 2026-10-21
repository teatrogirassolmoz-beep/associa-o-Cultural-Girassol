# Associação Cultural Girassol + FITI

Site institucional da Associação Cultural Girassol e do FITI com estrutura de CMS editável via `/admin`, mantendo export estático para GitHub Pages e compatibilidade com Vercel.

## Instalação

```bash
npm install
npm run dev
```

## Build e lint

```bash
npm run lint
npm run build
```

## Como funciona o CMS

O código mantém apenas a estrutura visual. O conteúdo público é carregado por `lib/cms.ts` nesta ordem:

1. Supabase, quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existem.
2. `lib/data.ts`, como fallback institucional inicial.
3. Mensagem final de actualização quando uma área ainda não tem conteúdo.

As páginas públicas respeitam `page_sections.order_index` e `page_sections.is_active`, por isso o gestor pode reordenar ou ocultar secções sem mexer no código. Sem Supabase configurado, o site público continua funcional com os dados de fallback e `/admin` mostra um aviso elegante de configuração em vez de falhar.

## Configurar Supabase

1. Criar projecto no Supabase.
2. Executar `supabase/schema.sql` no SQL Editor.
5. Executar `supabase/seed.sql` no SQL Editor.
4. Criar um utilizador em Authentication.
5. Registar o utilizador em `admin_profiles` com `role = 'admin'`.
6. Configurar as variáveis públicas do frontend:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do projecto>
```

A anon key deve ser configurada no ambiente onde o site é executado. Nunca coloque a anon key em ficheiros versionados e nunca use a `service_role` key no frontend.

## Variáveis de ambiente locais

Crie um ficheiro `.env.local` a partir de `.env.local.example` e preencha os valores localmente:

```bash
cp .env.local.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do projecto>
```

O ficheiro `.env.local` não deve ser publicado no GitHub. Se uma variável ficar vazia, o fallback de `lib/data.ts` mantém o site público activo e o `/admin` mostra o aviso de configuração.

## Variáveis no GitHub Actions

No GitHub Pages, as variáveis `NEXT_PUBLIC_*` precisam de existir como GitHub Secrets e também precisam de ser passadas explicitamente ao passo `npm run build` no workflow `.github/workflows/deploy.yml`, porque o export estático incorpora estes valores públicos durante o build.

Configure os secrets em:

`GitHub repository > Settings > Secrets and variables > Actions > Repository secrets`

Crie os secrets:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

O workflow passa esses secrets apenas como variáveis de ambiente do build. Não guarde a anon key directamente no workflow, README ou outros ficheiros versionados, e não configure `service_role` em GitHub Actions para o frontend.

## Variáveis na Vercel

No painel da Vercel, abra:

`Project Settings > Environment Variables`

Adicione as variáveis para Production, Preview e Development, conforme necessário:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do projecto>
```

Depois faça redeploy. A Vercel injecta as variáveis no build e no runtime do frontend. Não use a `service_role` key em variáveis `NEXT_PUBLIC_*`.

## Primeiro admin

Crie o utilizador no painel Supabase Auth e, no SQL Editor, registe o UUID em `admin_profiles` com `role = admin`. A função `is_admin()` usa esse perfil para permitir gestão do CMS, media e formulários.

## Tabelas principais

- `admin_profiles`
- `pages`
- `page_sections`
- `section_fields`
- `theme_settings`
- `media_assets`
- `navigation_items`
- `social_links`
- `content_revisions`
- `news`
- `partners`
- `gallery`
- `projects`
- `impact_stats`
- `timeline`
- `fiti_editions`
- `fiti_program`
- `fiti_companies`
- `fiti_workshops`
- `fiti_archive`
- `fiti_applications`
- `contact_messages`

## Editar textos

Aceda a `/admin`, entre com Supabase Auth, abra `Homepage`, `FITI` ou `Secções` e altere os campos gerados por `section_fields`. Cada campo define o tipo (`text`, `textarea`, `richtext`, `url`, `color`, `boolean`, `json`, etc.).

Também pode abrir o CMS com dois cliques no logo principal do site, mantendo o acesso directo por `/admin`.

## Editar imagens, vídeos e PDFs

Use `Media Library` para guardar URLs vindas de Supabase Storage ou Cloudinary. O admin não grava binários em `public/` e o GitHub deve receber apenas código, SQL e texto.

## Mudar fundo e cores

Em `Aparência`, altere `theme_settings`: cores, gradientes, imagem de fundo, vídeo de fundo, partículas, luzes de palco, logo animado, intensidade de movimento, fontes e raios dos cards. O componente `DynamicBackground` aplica essas opções no site público.

## Editar homepage e FITI

- `Homepage`: gere `home_hero`, `home_about`, `home_mission_vision`, `home_timeline`, `home_what_we_do`, `home_projects`, `home_impact`, `home_gallery`, `home_news`, `home_partners` e `home_contact`.
- `FITI`: gere `fiti_hero`, `fiti_about`, `fiti_current_edition`, `fiti_program`, `fiti_companies`, `fiti_workshops`, `fiti_tickets`, `fiti_archive`, `fiti_partners`, `fiti_press` e `fiti_contact`.

## Publicar no GitHub Pages

Mantenha o `next.config.mjs` existente para export estático/basePath. Não dependa de `app/api` para contacto, inscrições ou admin; use Supabase client directamente. O workflow em `.github/workflows/deploy.yml` mantém compatibilidade com GitHub Pages, passa as variáveis públicas do Supabase durante o build e publica sempre a pasta `./out` gerada por `npm run build`.

No GitHub, configure a publicação em:

`GitHub > Settings > Pages > Build and deployment > Source: GitHub Actions`

Não use `Deploy from branch` para este projecto. Essa opção publica a raiz ou uma pasta do repositório directamente e pode mostrar o `README.md` em vez da aplicação Next.js exportada. A publicação correcta deve ser feita pelo workflow de GitHub Actions, que envia `./out` como artifact do Pages.

## Publicar na Vercel

Configure as mesmas variáveis Supabase no projecto Vercel e execute o deploy normalmente. API routes podem ser adicionadas apenas como opcionais, nunca como requisito do site.

## Boas práticas de conteúdo

Não usar textos genéricos. Quando faltar conteúdo real, usar: “Conteúdo em actualização. Em breve serão publicadas novas informações.”

## Como entrar no CMS

1. Aceder a `/admin` (ou `/Associa-o-cultural-girassol/admin/` no GitHub Pages quando o site usa `basePath`) ou dar dois cliques no logo principal do site.
2. Criar projecto Supabase.
3. Executar `supabase/schema.sql` no SQL Editor.
4. Executar `supabase/seed.sql` no SQL Editor.
5. Criar utilizador em Authentication.
6. Copiar o User UID.
7. Inserir o utilizador em `admin_profiles` com `role = 'admin'`.
8. Configurar as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
9. Fazer login em `/admin` com o email e password do utilizador criado.

Se as variáveis Supabase não existirem, a página `/admin` não fica em branco: mostra uma mensagem elegante com os passos de configuração.

## Como activar o logo em movimento no fundo

No CMS, aceda a `/admin`, abra `Aparência`, active `animated_background_enabled`, active `animated_logo_enabled` e ajuste `animated_logo_opacity` e `animated_logo_speed`. A área de Aparência controla `animated_background_enabled`, `animated_logo_enabled`, `animated_logo_opacity`, `animated_logo_speed`, `background_motion_intensity`, cores, gradiente, partículas e luzes de palco.

Se preencher `animated_logo_url`, esse ficheiro é usado no movimento. Se não existir PNG/JPG, o site usa automaticamente um símbolo SVG inline inspirado no sol/girassol e máscara teatral da Associação Cultural Girassol, mantendo baixa opacidade e respeitando `prefers-reduced-motion`.

## Como mudar logotipos no CMS

1. Entrar no CMS em `/admin` com o utilizador configurado no Supabase Auth.
2. Ir a **Media Library** no CMS ou ao **Supabase Storage**.
3. Carregar o logotipo pretendido no storage/media.
4. Copiar o URL público da imagem carregada.
5. Ir a **Identidade Visual** no menu lateral do CMS.
6. Colar o URL em `site_logo_url` para o logotipo principal da Associação ou em `fiti_logo_url` para o logotipo do FITI. Também pode preencher `favicon_url`, `footer_logo_url`, `hero_logo_url` e `animated_logo_url` conforme necessário.
7. Guardar cada campo alterado com o botão **Guardar**.
8. Actualizar o site público para confirmar a navbar, hero, rodapé, página FITI e fundo animado.

Se um URL estiver vazio ou a imagem não carregar, o site mantém automaticamente os logotipos CSS/SVG de fallback, sem exigir ficheiros PNG/JPG no GitHub.

## Manual operacional do CMS depois do checkup

### Media Library

A área **Media Library** em `/admin` envia imagens, vídeos e PDFs para o bucket público `site-media`. O formulário pede título, descrição, texto alternativo, categoria e ficheiro. Depois do upload, o CMS obtém o URL público do Supabase Storage, grava o registo em `media_assets`, actualiza a listagem, permite copiar o URL, seleccionar o ficheiro em campos de identidade visual e apagar o registo quando necessário.

Pastas usadas automaticamente:

- `logos/`
- `fiti/`
- `gallery/`
- `partners/`
- `news/`
- `documents/`
- `videos/`

### Identidade Visual

Em **Identidade Visual**, cada campo tem label amigável, descrição, input, preview e botão **Seleccionar da Media Library**. O botão abre uma lista compacta dos ficheiros carregados e preenche o URL seleccionado. Ao guardar, o CMS faz `upsert` em `theme_settings`.

Chaves principais:

- `site_logo_url`, `site_logo_alt`
- `fiti_logo_url`, `fiti_logo_alt`
- `favicon_url`
- `footer_logo_url`
- `hero_logo_url`
- `animated_logo_url`, `animated_logo_enabled`, `animated_logo_opacity`, `animated_logo_speed`

### Aparência

Em **Aparência**, os campos foram apresentados com nomes humanos, como “Cor principal”, “Cor secundária”, “Activar fundo animado”, “Vídeo de fundo”, “Luzes de palco activas” e “Opacidade da camada”. Todos guardam em `theme_settings` e o site mantém fallback visual se alguma chave estiver vazia.

### Homepage e FITI

As áreas **Homepage** e **FITI** listam as secções existentes (`page_sections`) e campos (`section_fields`) que servem de base para editar textos, botões, mensagens de estado, títulos e descrições. Quando Supabase estiver vazio, os dados institucionais em `lib/data.ts` impedem páginas em branco.

### Menus e conteúdos estruturados

As áreas **Menus**, **Galeria**, **Notícias**, **Projectos**, **Timeline**, **Impacto**, **Parceiros**, **Programação FITI**, **Companhias FITI**, **Oficinas FITI** e **Arquivo FITI** têm interface de listagem, criação, edição, guardar, activar/desactivar e apagar quando aplicável. Cada área lê a respectiva tabela Supabase e mostra dados institucionais de fallback se a tabela ainda não tiver conteúdos.

### Formulários, contactos e imprensa

Os formulários públicos gravam directamente no Supabase através do cliente público quando configurado. No CMS, **Contactos** e **Imprensa** listam mensagens recebidas e permitem acompanhar o estado. Sem Supabase, a interface mostra uma mensagem clara em vez de quebrar.

## Resolver erros comuns

- **`/admin` mostra “Área de gestão indisponível”**: confirme `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no ambiente local, GitHub Secrets ou Vercel.
- **Login falha**: confirme que o utilizador existe em Supabase Auth e que o mesmo UUID está em `admin_profiles` com `role = 'admin'`.
- **Upload falha por bucket inexistente**: execute `supabase/schema.sql` ou crie o bucket público `site-media` manualmente se o SQL não tiver permissões para storage.
- **Media Library lista vazia**: confirme que `media_assets` existe, que RLS foi aplicado e que o utilizador está autenticado.
- **Build de GitHub Pages sem Supabase**: é esperado continuar a passar; o site público usa fallback e o CMS mostra aviso de configuração.
- **Logotipo não aparece**: confirme que o URL público abre no navegador. Se falhar, o site volta automaticamente para `GirassolLogo`, `FitiLogo` ou símbolo SVG do fundo animado.

## Como testar logotipos CMS → site público

1. Entrar em `/admin` com um utilizador existente no Supabase Auth e com perfil em `admin_profiles`.
2. Abrir **Media Library** no CMS e carregar a imagem pretendida. A Media Library grava o ficheiro no bucket público `site-media` com caminho único no formato `categoria/timestamp-uuid-nome.ext`.
3. Copiar ou seleccionar o URL público gerado pela Media Library.
4. Abrir **Identidade Visual**, escolher o campo pretendido (`site_logo_url`, `hero_logo_url`, `footer_logo_url`, `fiti_logo_url` ou `animated_logo_url`) e guardar.
5. Abrir a área **Diagnóstico** no CMS e executar **Testar ligação Supabase**, **Testar leitura theme_settings**, **Testar gravação theme_settings**, **Testar upload site-media** e **Testar leitura pública dos logotipos**.
6. Abrir o site público com `?debug=theme`, por exemplo `https://dc-t-spec.github.io/Associa-o-cultural-girassol/?debug=theme`.
7. Confirmar na caixa de debug que `theme_settings carregado` está como `sim` e que `site_logo_url`, `hero_logo_url`, `footer_logo_url`, `fiti_logo_url` ou `animated_logo_url` mostram o URL guardado.
8. Confirmar na mesma caixa que o `ManagedLogo` correspondente indica `imagem real`, a `key usada` correcta e o URL público esperado.
9. Actualizar a página. O logotipo deve mudar sem deploy novo, sem hardcode e sem imagem adicionada ao GitHub. Se aparecer `fallback`, verificar a mensagem exacta do Diagnóstico: RLS, bucket `site-media`, URL vazio, utilizador sem admin ou erro real devolvido pelo Supabase.

## Membros e avisos do site

O novo menu **Explorar áreas** organiza a Associação, o universo FITI e as formas de participação. A identidade pública combina lavanda, violeta eléctrico, ciano e coral, com fundos luminosos e interfaces translúcidas. O movimento respeita a preferência do dispositivo por animações reduzidas. A abertura inclui um campo de luz em movimento, um campo de pigmentos que reage ao rato e ao toque e uma escultura digital interactiva. O botão “Mudar energia” alterna entre Pulso solar, Órbita líquida e Campo magnético. A escultura pára quando sai do ecrã ou quando o movimento é desactivado. O botão “Pausar movimento” permite parar o cenário sem interromper a navegação; a faixa de avisos mantém o seu próprio controlo de pausa.

No CMS autenticado, abra **Conteúdos → Membros** para adicionar, editar ou remover perfis. Cada perfil tem nome, função, área (Associação ou FITI), URL da fotografia e biografia. Pode carregar a fotografia na **Media Library** e copiar o URL público para o perfil. Publique apenas fotografias e biografias autorizadas. Sem perfis, o site apresenta uma mensagem de preparação; não cria pessoas fictícias. Na página pública, os visitantes podem filtrar, pesquisar e abrir biografias.

Em **Conteúdos → Avisos**, escreva os textos da faixa inferior e os respectivos links. Pode apontar para `/fiti#formularios`, `/fiti#programacao`, notícias ou páginas externas HTTP(S). Guardar uma lista vazia oculta a faixa. Os visitantes podem pausar a animação; o movimento também pára ao passar o cursor ou usar o teclado.

A direcção artística combina o palco futurista com composições originais sobre corpo, voz, formação e encontro, o motivo do girassol e a história documentada da Associação desde 1987. As ilustrações não representam fotografias de espectáculos ou cartazes oficiais de edições do FITI. As imagens publicadas no CMS têm prioridade sobre as composições de fallback.

Em **Homepage → Quem somos**, pode editar o título e o texto institucional e adicionar o URL e a legenda de uma fotografia carregada na Media Library. Os novos campos opcionais são gravados em `section_fields`, sem exigir uma nova tabela. As imagens de projectos e da galeria continuam nas respectivas áreas do CMS. Os projectos têm detalhes expansíveis, e as áreas de actuação são apresentadas como um programa de palco interactivo.

Os perfis e avisos são guardados nas chaves `member_profiles` e `announcement_items` da tabela existente `theme_settings`, através das permissões de administrador já configuradas. Não é necessária uma tabela nova. Sem Supabase configurado, a área de membros e os avisos de navegação funcionam com estado local inicial; a edição persistente exige configurar o Supabase conforme as instruções acima. Os formulários sem ligação não apresentam confirmações falsas de envio.

Para executar os testes das listas, perfis e validação de links:

```bash
node --test tests/community.test.mjs
```


## Calendário interactivo do FITI

A programação tem uma vista de calendário mensal e uma agenda cronológica, filtros por categoria e local, pesquisa por artista/espectáculo e acesso rápido aos dias com actividades. No calendário, as teclas de seta mudam de dia; Home/End vão ao início/fim da semana e Page Up/Page Down mudam de mês. Os detalhes abrem numa janela que pode ser fechada com Escape.

O calendário reúne `fiti_program` e `fiti_workshops` da edição activa mais recente em `fiti_editions`. Não usa eventos de edições antigas nem os conteúdos do site de referência. As repetições de um espectáculo em datas diferentes são preservadas. Sem programação, o calendário continua navegável e apresenta um estado de preparação, sem inventar eventos ou datas oficiais.

No CMS, abra **Gestão do FITI → Edições FITI**, crie/active a edição, e depois preencha **Programação FITI** e **Oficinas FITI**. Seleccione a edição em cada registo, publique a data e a hora local de Moçambique e deixe a actividade activa. Para actividades em vários dias, crie um registo por data. Datas vazias são guardadas como nulas e ficam em “Datas por confirmar”. Pode usar categorias como Teatro, Dança, Música, Seminário ou Debate. Os links de reserva/inscrição são opcionais. As fotografias da programação continuam a ser configuradas pelo campo Imagem; as composições sem fotografia são identificadas como ilustrações.

“Adicionar à minha agenda” descarrega um ficheiro `.ics` com o fuso `Africa/Maputo` (UTC+2). Uma hora não confirmada é exportada apenas como data, sem inventar horários; a hora final só é incluída quando existe uma duração reconhecida em minutos. Os ficheiros são gerados no navegador, compatíveis com exportação estática/GitHub Pages.

O menu fixo adapta-se à Associação ou ao FITI e mantém os atalhos adicionais do CMS no botão Menu. O fundo de pigmentos responde ao movimento e ao toque fora dos controlos, respeita a pausa e a preferência por movimento reduzido e interrompe a animação fora do ecrã.

A fonte condensada dos títulos do FITI é **Bebas Neue**, distribuída por `@fontsource/bebas-neue` 5.3.0, alojada localmente em `app/fonts`. A licença SIL Open Font License acompanha o ficheiro; não é necessário carregar fontes de serviços externos.

Testes de datas, filtros, repetições, fuso e exportação de calendário:

```bash
node --test tests/fitiCalendar.test.mjs tests/community.test.mjs
```

O destaque do FITI na página inicial e a abertura do festival incluem o contorno geográfico de Moçambique, com Maputo assinalado. Fonte do contorno: Natural Earth (domínio público), distribuído por [datasets/geo-countries](https://github.com/datasets/geo-countries). O SVG local é simplificado para apresentação editorial; não representa locais de espectáculos. Os dias do calendário mostram horários e títulos em ecrãs largos e indicadores de categoria em telemóveis, mantendo a agenda detalhada acessível ao seleccionar uma data.

Fotografias da abertura: no painel, abra **Página inicial → Destaque principal** ou **FITI → Destaque FITI**. Existem três pares de campos «Fotografia do cartaz» e «Descrição da fotografia», correspondentes a Teatro, Encontro e Movimento. Carregue os ficheiros na **Biblioteca de imagens**, copie os endereços públicos e guarde os campos. Uma imagem em falta ou que falhe mantém a ilustração. O destaque FITI da página inicial tem título e texto editáveis no Destaque principal. Os logótipos continuam ligados à Identidade Visual; o menu do festival tem um regresso permanente à Associação.

Por defeito, a faixa de parceiros aparece no fim do conteúdo público dos dois sites, antes do rodapé; a posição é configurável em Aparência. Em **Conteúdos → Parceiros**, defina nome, categoria, logótipo, ligação, ordem, estado activo e as opções **Página inicial** / **FITI**. A faixa só apresenta parceiros publicados para a página respectiva. Com dois ou mais parceiros, os logótipos passam continuamente; pode pausar no botão, ao passar o rato, pelo controlo geral de movimento ou usando a preferência de movimento reduzido do dispositivo. Com um parceiro, a apresentação é estática. Sem registos, mostra uma mensagem, sem inventar apoios. A visibilidade da secção continua controlada no CMS; em Aparência pode optar pelo fim, pela ordem das secções ou por antes dos contactos.

### Gestão completa da apresentação

Em **Aparência**, as paletas da Associação e do FITI, o fundo animado, o rato/toque, a intensidade, o mapa, o destaque FITI, as chamadas dos menus, a posição e velocidade dos parceiros e a apresentação dos avisos têm controlos próprios. O botão **Guardar apresentação** grava os campos alterados e confirma a leitura; erros de leitura/gravação ficam visíveis e não são apresentados como sucesso. Os valores iniciais preservam o desenho actual. A actualização aparece ao abrir ou actualizar a página pública.

Em **Página inicial** e **FITI**, os editores incluem os textos decorativos, frases e legendas dos três cartazes, fotografias, chamadas e destinos dos botões. Os campos novos são acrescentados ao editor de secções existentes sem substituir os valores guardados. **Menus** controla texto, destino, ordem e estado dos itens; os primeiros seis entram no cabeçalho (com lugar reservado ao FITI quando o destaque está activo) e o menu completo apresenta todos os itens activos. Desactivar ou remover um item retira-o da navegação; não volta a aparecer por estar definido num menu fixo. Os grupos do menu completo correspondem a menu principal, menu FITI e menu do rodapé.

A faixa de parceiros pode ficar no fim, na ordem das secções ou antes dos contactos. No modo antes dos contactos, fica no fim se a secção de contactos estiver oculta. Ocultar a própria secção de parceiros continua a ocultar a faixa. Datas e actividades do calendário continuam ligadas à edição activa; a vista inicial e a visibilidade dos filtros são editáveis em Programação FITI. As opções de reduzir movimento e os controlos de pausa dos visitantes continuam disponíveis independentemente da configuração do painel. Os elementos funcionais da aplicação (validação, acessibilidade e estrutura dos formulários) permanecem implementados em código.

As opções de **Identidade Visual** para símbolo de fundo (ficheiro, activação, opacidade e velocidade) e ícone do separador também são aplicadas à abertura pública. As definições de título e descrição em **Páginas** actualizam o título do separador e a descrição no navegador. Como o site é uma exportação estática, o HTML inicial mantém os metadados institucionais até o CMS ser carregado; os metadados por página provenientes do CMS são aplicados no cliente.

### Campos do CMS actual

Os editores de Página inicial e FITI apresentam apenas os campos usados pelos componentes actuais, definidos em `lib/cmsFields.ts`. Campos e secções do site antigo ficam fora do painel, mas os registos existentes são preservados. Nomes antigos equivalentes (por exemplo, `primary_button_label` e `primary_button_text`) são apresentados num único controlo com o nome actual. Antes da primeira gravação, o valor antigo é aproveitado; depois, a chave actual tem prioridade na leitura pública, incluindo quando é apagada intencionalmente. Guardar uma secção não apaga nem regrava os campos retirados. Ao acrescentar um novo campo público, actualize a lista de campos activos e a respectiva definição em `lib/data.ts`.
