import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const {outputText}=ts.transpileModule(readFileSync(new URL('../lib/presentation.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}});
const {resolvePresentation,presentationDefaults}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
test('invalid stored colours and unsupported layout values preserve usable presentation',()=>{
 const config=resolvePresentation({home_hero_color:'url(javascript:alert(1))',fiti_ink_color:'red;display:none',partners_placement:'delete',notices_mode:'popup'});
 assert.equal(config.home_hero_color,presentationDefaults.home_hero_color);assert.equal(config.fiti_ink_color,presentationDefaults.fiti_ink_color);assert.equal(config.partners_placement,'end');assert.equal(config.notices_mode,'floating');
});
test('CMS controls preserve distinct page palettes and bounded animation values',()=>{
 const config=resolvePresentation({home_hero_color:'#ffcc00',fiti_hero_color:'#ff8800',cursor_strength:500,partners_duration:-2,notices_duration:'not a number',cursor_interaction_enabled:false,partners_motion_enabled:'0'});
 assert.equal(config.home_hero_color,'#ffcc00');assert.equal(config.fiti_hero_color,'#ff8800');assert.equal(config.cursor_strength,'2');assert.equal(config.partners_duration,'10');assert.equal(config.notices_duration,'40');assert.equal(config.cursor_interaction_enabled,'false');assert.equal(config.partners_motion_enabled,'false');
});
test('text remains plain data and missing new settings retain the existing layout',()=>{
 const config=resolvePresentation({menu_title:'<script>alert(1)</script>',notices_label:''});assert.equal(config.menu_title,'<script>alert(1)</script>');assert.equal(config.notices_label,'');assert.equal(config.partners_placement,'end');assert.equal(config.fiti_spotlight_enabled,'true');
});
