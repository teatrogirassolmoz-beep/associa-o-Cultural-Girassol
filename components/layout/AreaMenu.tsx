"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { usePublicNavigation } from "@/hooks/usePublicNavigation";
import { usePresentation } from "@/components/ui/SitePresentation";
import { safePublicHref } from "@/lib/community";
export function AreaMenu() {
 const dialog=useRef<HTMLDialogElement>(null);const config=usePresentation();
 const main=usePublicNavigation('main_menu'), fiti=usePublicNavigation('fiti_menu'), footer=usePublicNavigation('footer_menu');
 const groups=[{title:config.menu_home_title,items:main.data,fiti:false},{title:config.menu_fiti_title,items:fiti.data,fiti:true},{title:config.menu_footer_title,items:footer.data,fiti:false}];
 return <><button type="button" className="area-menu-trigger" aria-label="Menu" aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}><span>Menu</span><Menu size={21}/></button>
 <dialog ref={dialog} className="area-menu" aria-labelledby="area-menu-title" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}><div className="area-menu-top"><p>{config.home_brand_label} × {config.fiti_brand_label}</p><button type="button" className="dialog-close" aria-label="Fechar menu" onClick={()=>dialog.current?.close()}><X/></button></div><h2 id="area-menu-title">{config.menu_title}</h2>
 <nav aria-label="Todas as áreas" className="area-menu-grid">{groups.map((group,index)=><div key={index} className={group.fiti&&config.fiti_menu_highlight==='true'?'area-menu-fiti':undefined}><p className="area-group-number">0{index+1}</p><h3>{group.title}</h3>{group.items.map(item=>{const href=safePublicHref(item.url);if(!href)return null;const path=href.startsWith('#')?`${group.fiti?'/fiti':'/'}${href}`:href;return <Link key={item.id||item.url} href={path} onClick={event=>{dialog.current?.close();if(path.includes('?')){event.preventDefault();window.location.assign(event.currentTarget.href);}}}>{item.label}<ArrowUpRight size={16}/></Link>})}</div>)}</nav><p className="area-menu-signature">{config.menu_signature}</p></dialog></>;
}
