"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSection, text } from "@/components/publicCms";
import { ManagedLogo } from "@/components/ui/ManagedLogo";
import { FitiLogo } from "@/components/ui/FitiLogo";
import { MozambiqueMap } from "@/components/art/MozambiqueMap";
export function FitiSpotlight() {
 const f = useSection("home_hero");
 return <section className="fiti-spotlight" aria-labelledby="fiti-spotlight-title">
 <div className="fiti-spotlight-map"><MozambiqueMap/><span>MOÇAMBIQUE ↗ MUNDO</span></div>
 <div className="fiti-spotlight-copy"><ManagedLogo settingKey="fiti_logo_url" alt="FITI" className="spotlight-official-logo" fallback={<FitiLogo/>}/><p className="festival-eyebrow">GIRASSOL APRESENTA</p><h2 id="fiti-spotlight-title">{text(f.fiti_spotlight_title, "É TEMPO DE FITI.")}</h2><p className="fiti-spotlight-name">Festival Internacional Teatro de Inverno</p><p>{text(f.fiti_spotlight_text, "O palco é encontro. O teatro atravessa fronteiras. Descubra o universo do FITI: espectáculos, oficinas e intercâmbio artístico.")}</p><div className="hero-actions"><Link className="festival-button" href="/fiti">Entrar no festival <ArrowUpRight size={20}/></Link><Link className="festival-button festival-button-outline" href="/fiti/#programacao">Explorar o calendário <ArrowUpRight size={20}/></Link></div></div>
 <span className="fiti-spotlight-index" aria-hidden="true">TEATRO SEM FRONTEIRAS / FITI</span>
 </section>;
}
