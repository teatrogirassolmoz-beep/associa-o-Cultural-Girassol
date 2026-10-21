import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const {outputText}=ts.transpileModule(readFileSync(new URL('../lib/cmsFields.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}});
const {selectEditableFields,applyFieldAliases,isCurrentSection,isCurrentField}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const f=(key,value,label=key)=>({id:key,section_id:'real-section',field_key:key,field_value:value,field_label:label,field_type:'text',order_index:1});
test('retired fields disappear from the editor without changing saved records',()=>{
 const old=[f('section_title','Galeria actual'),f('section_text','Texto do site antigo'),f('old_banner','Não apagar')];const before=JSON.stringify(old);
 const editable=selectEditableFields('home_gallery',old,[f('section_title','Galeria','Título'),f('section_text',''),f('eyebrow','Galeria','Chamada')]);
 assert.deepEqual(editable.map(x=>x.field_key),['section_title','eyebrow']);assert.equal(editable[0].field_value,'Galeria actual');assert.equal(editable[0].field_label,'Título');assert.equal(JSON.stringify(old),before);assert.equal(isCurrentSection('home_old_banner'),false);assert.equal(isCurrentField('fiti_program','button_text'),false);assert.equal(isCurrentField('fiti_program','layout_style'),true);
});
test('legacy aliases fill one current control and canonical values take precedence',()=>{
 const defaults=[f('title','Título inicial','Título'),f('primary_button_text','Botão inicial','Botão')];const fields=[f('section_title','Título antigo válido'),f('primary_button_label','Ver o festival')];
 const current=selectEditableFields('home_hero',fields,defaults);assert.deepEqual(current.map(x=>[x.field_key,x.field_value]),[['title','Título antigo válido'],['primary_button_text','Ver o festival']]);
 const both=applyFieldAliases({title:'Novo título',section_title:'Antigo',primary_button_text:'Novo botão',primary_button_label:'Antigo botão'},'home_hero');assert.equal(both.section_title,'Novo título');assert.equal(both.primary_button_label,'Novo botão');
 const cleared=applyFieldAliases({primary_button_text:'',primary_button_label:'Antigo'},'home_hero');assert.equal(cleared.primary_button_label,'');
});
test('editor and public aliases agree across hero and ordinary sections',()=>{
 assert.equal(applyFieldAliases({title:'Título compatível'},'home_gallery').section_title,'Título compatível');assert.equal(applyFieldAliases({description:'Texto antigo'},'fiti_about').section_text,'Texto antigo');assert.equal(applyFieldAliases({section_text:'Abertura antiga'},'fiti_hero').description,'Abertura antiga');
 const stored=[f('section_title','Título actual'),f('title','Título antigo')];const current=selectEditableFields('home_gallery',stored,[f('section_title','')]);assert.equal(current[0].field_value,'Título actual');assert.equal(applyFieldAliases({section_title:'Título actual',title:'Título antigo'},'home_gallery').title,'Título actual');
});
