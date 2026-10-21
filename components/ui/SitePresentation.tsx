"use client";
import { createContext, useContext, useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { safePublicHref } from "@/lib/community";
import { usePublicRows } from "@/hooks/usePublicRows";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { presentationDefaults, resolvePresentation } from "@/lib/presentation";
const RawContext=createContext<Record<string,unknown>>({});
export const usePresentationSettings=()=>useContext(RawContext);
const Context=createContext(presentationDefaults);
export const usePresentation=()=>useContext(Context);
export function SitePresentation({fiti=false,children}:{fiti?:boolean;children:ReactNode}){
 const {settings}=useThemeSettings();
 const {data:pages}=usePublicRows<{seo_title?:string;seo_description?:string}>('pages',[],q=>q.eq('slug',fiti?'fiti':'home').eq('is_published',true).limit(1));
 useEffect(()=>{
  const page=pages[0];if(!page)return;
  const oldTitle=document.title;let description=document.querySelector<HTMLMetaElement>('meta[name="description"]');const existed=Boolean(description);const oldDescription=description?.content||'';
  if(page.seo_title)document.title=page.seo_title;
  if(page.seo_description){if(!description){description=document.createElement('meta');description.name='description';document.head.appendChild(description);}description.content=page.seo_description;}
  return()=>{document.title=oldTitle;if(description){if(existed)description.content=oldDescription;else description.remove();}};
 },[pages]);
 const favicon=safePublicHref(settings.favicon_url);
 useEffect(()=>{if(!favicon||favicon.startsWith('#'))return;const link=document.createElement('link');link.rel='icon';link.href=favicon;link.dataset.cmsFavicon='true';document.head.appendChild(link);return()=>link.remove();},[favicon]);
 const config=useMemo(()=>resolvePresentation(settings),[settings]);
 const page=fiti?'fiti':'home';
 const styles:Record<string,string>={};
 for(const key of ['hero','section_1','section_2','section_3','panel','nav','footer','ink','accent','brush']) styles[`--cms-${key.replaceAll('_','-')}`]=config[`${page}_${key}_color`];
 styles['--partner-duration']=config.partners_duration+'s';styles['--notice-duration']=config.notices_duration+'s';
 return <Context.Provider value={config}><RawContext.Provider value={settings}><div className={`festival-site cms-presentation ${fiti?'fiti-site':''}`} style={styles as CSSProperties} data-fiti-highlight={config.fiti_menu_highlight} data-background-motion={config.animated_background_enabled}>{children}</div></RawContext.Provider></Context.Provider>;
}
