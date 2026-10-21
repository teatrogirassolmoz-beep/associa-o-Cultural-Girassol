"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MozambiqueMap } from "@/components/art/MozambiqueMap";
export function FitiSpotlight() {
 return <section className="fiti-spotlight" aria-labelledby="fiti-spotlight-title">
 <div className="fiti-spotlight-map"><MozambiqueMap/><span>MOÇAMBIQUE ↗ MUNDO</span></div>
 <div className="fiti-spotlight-copy"><p className="festival-eyebrow">GIRASSOL APRESENTA</p><h2 id="fiti-spotlight-title">É TEMPO<br/>DE <em>FITI.</em></h2><p className="fiti-spotlight-name">Festival Internacional Teatro de Inverno</p><p>O palco é encontro. O teatro atravessa fronteiras. Descubra o universo do FITI: espectáculos, oficinas e intercâmbio artístico.</p><div className="hero-actions"><Link className="festival-button" href="/fiti">Entrar no festival <ArrowUpRight size={20}/></Link><Link className="festival-button festival-button-outline" href="/fiti/#programacao">Explorar o calendário <ArrowUpRight size={20}/></Link></div></div>
 <span className="fiti-spotlight-index" aria-hidden="true">TEATRO SEM FRONTEIRAS / FITI</span>
 </section>;
}
