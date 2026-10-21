#!/usr/bin/env python3
"""Gera HTML e PDF do manual. Requer Python e reportlab (apenas documentação)."""
from pathlib import Path
import re
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, KeepTogether
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'docs/MANUAL_UTILIZACAO_CMS.md'
output = ROOT / 'public/manual'
output.mkdir(parents=True, exist_ok=True)
text = source.read_text()
# O Markdown é deliberadamente simples: títulos, parágrafos, listas e imagens.
blocks = re.split(r'\n\s*\n', text.strip())
sections=[]; html=[]; toc=[]
fontdir=Path('/usr/share/fonts/truetype/dejavu')
for name, file in [('Manual','DejaVuSans.ttf'),('ManualBold','DejaVuSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(fontdir/file)))
pdfmetrics.registerFontFamily('Manual',normal='Manual',bold='ManualBold',italic='Manual',boldItalic='ManualBold')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyManual',fontName='Manual',fontSize=9.4,leading=14.5,spaceAfter=9,textColor=colors.HexColor('#30283c')))
styles.add(ParagraphStyle(name='TitleManual',fontName='ManualBold',fontSize=27,leading=34,spaceAfter=20,textColor=colors.HexColor('#4b2369')))
styles.add(ParagraphStyle(name='HeadingManual',fontName='ManualBold',fontSize=17,leading=23,spaceBefore=15,spaceAfter=13,textColor=colors.HexColor('#4b2369'),keepWithNext=True))
styles.add(ParagraphStyle(name='CaptionManual',fontName='Manual',fontSize=8,leading=12,spaceBefore=7,spaceAfter=15,textColor=colors.HexColor('#654b6d')))
styles.add(ParagraphStyle(name='ListManual',parent=styles['BodyManual'],leftIndent=12,firstLineIndent=-10))
class ManualDoc(SimpleDocTemplate):
    def afterFlowable(self,f):
        if isinstance(f,Paragraph) and f.style.name=='HeadingManual':
            label=f.getPlainText(); key='sec-'+label.split('.')[0]
            self.canv.bookmarkPage(key); self.canv.addOutlineEntry(label,key,0)
            self.notify('TOCEntry',(0,label,self.page,key))

def footer(canvas,doc):
    canvas.saveState(); w,h=doc.pagesize
    canvas.setFillColor(colors.HexColor('#efb52d'));canvas.rect(0,h-5*mm,w,5*mm,fill=1,stroke=0)
    canvas.setStrokeColor(colors.HexColor('#ddd3e1'));canvas.line(20*mm,17*mm,w-20*mm,17*mm)
    canvas.setFont('Manual',8);canvas.setFillColor(colors.HexColor('#654b6d'))
    canvas.drawString(20*mm,12*mm,'GIRASSOL / FITI • Manual de utilização • Outubro 2026')
    canvas.drawRightString(w-20*mm,12*mm,str(doc.page));canvas.restoreState()

for block in blocks:
    if block.startswith('# '):
        title=block[2:]; html.append('<h1>'+escape(title)+'</h1>');sections.append(Paragraph(escape(title),styles['TitleManual']))
    elif block.startswith('## '):
        label=block[3:]; chapter=int(label.split(".")[0]);
        if 1 < chapter <= 37: sections.append(PageBreak())
        anchor='sec-'+label.split('.')[0];toc.append((anchor,label));html.append(f'<h2 id="{anchor}">{escape(label)}</h2>')
        sections.append(Paragraph(escape(label),styles['HeadingManual']))
    elif block.startswith('!['):
        match=re.fullmatch(r'!\[(.*?)\]\((.*?)\)',block,re.S)
        caption,path=match.groups(); path=path.removeprefix("../public/manual/"); filename=output/path
        html.append(f'<figure><a href="{escape(path)}" target="_blank" rel="noreferrer" aria-label="Ampliar imagem"><img src="{escape(path)}" alt="{escape(caption)}" loading="lazy"></a><figcaption>{escape(caption)}</figcaption></figure>')
        if filename.exists():
            pic=Image(str(filename)); ratio=pic.imageHeight/pic.imageWidth; pic.drawWidth=165*mm; pic.drawHeight=ratio*pic.drawWidth
            sections.append(KeepTogether([pic,Paragraph(escape(caption),styles['CaptionManual'])]))
        else: raise FileNotFoundError(filename)
    elif block.startswith('- ') or re.match(r'^\d+\. ',block):
        ordered=not block.startswith('- ');tag='ol' if ordered else 'ul';html.append('<'+tag+'>')
        for line in block.splitlines():
            content=re.sub(r'^(?:- |\d+\. )','',line)
            html.append('<li>'+escape(content)+'</li>')
            prefix=line[:line.index(' ')] if ordered else '•'
            sections.append(Paragraph(escape(prefix+' '+content),styles['ListManual']))
        html.append('</'+tag+'>')
    else:
        html.append('<p>'+escape(block).replace('\n',' ')+'</p>');sections.append(Paragraph(escape(block).replace('\n',' '),styles['BodyManual']))
# Índice depois da introdução, antes do primeiro capítulo.
first=next(i for i,f in enumerate(sections) if isinstance(f,Paragraph) and f.style.name=='HeadingManual')
pdf_toc=TableOfContents();pdf_toc.levelStyles=[ParagraphStyle(name='IndexManual',fontName='Manual',fontSize=9,leading=14,textColor=colors.HexColor('#4b2369'))]
sections[first:first]=[Spacer(1,10*mm),Paragraph('Índice',styles['HeadingManual']),pdf_toc,PageBreak()]
# Não adicionar o próprio índice à lista.
original=ManualDoc.afterFlowable
def after(self,f):
    if isinstance(f,Paragraph) and f.getPlainText()=='Índice':return
    original(self,f)
ManualDoc.afterFlowable=after
ManualDoc(str(output/'manual-utilizacao-cms.pdf'),pagesize=(210*mm,297*mm),rightMargin=20*mm,leftMargin=20*mm,topMargin=18*mm,bottomMargin=23*mm,title='Manual de utilização — Girassol e FITI',author='Associação Cultural Girassol',allowSplitting=True).multiBuild(sections,onFirstPage=footer,onLaterPages=footer)
nav='<nav aria-label="Índice"><h2>Índice</h2><ol>'+''.join(f'<li><a href="#{a}">{escape(t)}</a></li>' for a,t in toc)+'</ol></nav>'
body='\n'.join(html);pos=body.index('<h2 id=');body=body[:pos]+nav+body[pos:]
css='''*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;background:#fff5ce;color:#30283c;font:17px/1.75 system-ui,sans-serif}header{position:sticky;top:0;background:#4b2369;color:white;padding:14px 5%;display:flex;justify-content:space-between;gap:15px;z-index:2}header a{color:#ffe04b}main{max-width:1040px;margin:auto;background:#fffdf8;padding:45px 55px}h1{font-size:clamp(30px,5vw,52px);line-height:1.15;color:#4b2369}h2{color:#4b2369;line-height:1.35;margin-top:55px;border-top:5px solid #efb52d;padding-top:22px}a{color:#63318b}nav{background:#fff1b3;padding:18px 30px;border-radius:18px}nav h2{margin:0;border:0}nav ol{list-style:none;padding-left:0;columns:2;column-gap:30px}nav li{break-inside:avoid;margin:9px 0;font-size:15px}li{padding-left:4px;margin:9px 0}figure{margin:30px 0;break-inside:avoid}img{display:block;width:100%;border:1px solid #d8c5df;border-radius:10px}figcaption{font-size:14px;color:#654b6d;background:#f5edf8;padding:12px 16px}footer{text-align:center;padding:24px;font-size:14px}@media(max-width:650px){main{padding:25px 20px}nav ol{columns:1}header{font-size:13px}}@media print{header{position:static}header a,nav{display:none}body,main{background:white}main{padding:0;max-width:none}h2{break-after:avoid}a{color:inherit}}'''
(output/'manual-utilizacao-cms.html').write_text('<!doctype html><html lang="pt-MZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Manual de utilização — Girassol e FITI</title><style>'+css+'</style></head><body><header><b>GIRASSOL / FITI · Do site ao CMS</b><a href="manual-utilizacao-cms.pdf" download>Descarregar PDF</a></header><main>'+body+'</main><footer>Versão de 21 de Outubro de 2026 · Capturas de demonstração, sem dados privados.</footer></body></html>')
print('Manual HTML e PDF gerados em',output)
