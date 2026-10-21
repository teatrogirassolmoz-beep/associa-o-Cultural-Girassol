#!/usr/bin/env python3
"""Compõe o guia visual, seguido da referência completa dos procedimentos."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[2]
parts=json.loads((ROOT/'scripts/manual/partes.json').read_text())
ref=ROOT/'docs/REFERENCIA_CMS.md'
if not ref.exists():
    old=(ROOT/'docs/MANUAL_UTILIZACAO_CMS.md').read_text()
    old=old[old.index('## 1.'):]
    old=re.sub(r'!\[.*?\]\(.*?\)\n\n','',old)
    ref.write_text('# Referência de utilização do CMS\n\n'+old)
intro='''# Manual visual — Girassol e FITI

Do site ao CMS, parte por parte • Edição de 21 de Outubro de 2026

Este manual mostra primeiro a área que o visitante vê no site e, logo a seguir, o local do CMS onde essa área é alterada. Os pares de imagens têm o mesmo número e nome. O contorno rosa identifica a área ou o campo em causa. Por baixo de cada par encontra os passos e o botão para guardar.

As imagens mostram o desenho actual do site e do painel, num ambiente local de demonstração. Nomes de exemplo, datas, candidaturas, cartazes e logotipos de apoio ilustrativos não são anúncios oficiais e não foram publicados como conteúdos reais. Nenhuma captura expõe contactos ou candidaturas privadas. Não copie os dados nem os endereços locais das capturas: utilize os URLs públicos da sua própria biblioteca.

Comece pela imagem «1 — No site», siga o caminho indicado em «2 — Onde alterar» e execute os passos. Quando uma área utiliza mais de um editor, as capturas seguintes mostram os outros locais. A Biblioteca guarda o ficheiro; o editor de destino coloca a imagem no site. Guarde sempre antes de actualizar a página pública.

Nos capítulos 1 a 36 encontra o percurso visual da Associação, do FITI e dos elementos partilhados. Os capítulos seguintes explicam acesso, gravação, publicação, cuidados e resolução de problemas. Na versão HTML pode tocar numa imagem para a abrir no tamanho original; no PDF pode ampliar as páginas.

'''
chunks=[intro]
for i,p in enumerate(parts,1):
    prefix=f'{i:02d}'
    chunks += [f'## {i}. {p["title"]}\n\n',f'![1 — NO SITE: {p["title"]}. A área em causa está assinalada a rosa.](../public/manual/imagens/guia/{prefix}-site.png)\n\n',f'![2 — ONDE ALTERAR: {p["path"]}. O contorno rosa identifica o editor ou campo correspondente.](../public/manual/imagens/guia/{prefix}-cms.png)\n\n']
    for j,e in enumerate(p.get('extra',[]),3):
        chunks.append(f'![{j} — TAMBÉM NESTE LOCAL: {e["path"]}.](../public/manual/imagens/guia/{prefix}-cms-{j}.png)\n\n')
    chunks.append('\n'.join(f'{n}. {step}' for n,step in enumerate(p['steps'],1))+'\n\n')
old=ref.read_text();old=old[old.index('## 1.'):]
old=re.sub(r'^## (\d+)\.',lambda m:f'## {int(m[1])+len(parts)}.',old,flags=re.M)
chunks += [old]
(ROOT/'docs/MANUAL_UTILIZACAO_CMS.md').write_text(''.join(chunks))
print('Guia visual composto:',len(parts),'pares principais + referência de utilização.')
