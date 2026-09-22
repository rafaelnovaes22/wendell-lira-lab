import Image from "next/image";
import { ArrowUpRight, Play } from "lucide-react";
import type { PricingConfig } from "@/lib/pro-lab-types";

export function Hero({ pricing }: { pricing: PricingConfig }) {
  return (
    <section className="hero" id="top">
      <div className="hero-visual">
        <Image
          src="/hero-pro-lab.png"
          alt="Wendell Lira analisando partida de EA FC e eFootball em arena tática dourada"
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="shell hero-content">
        <p className="eyebrow">Puskás 2015, do campo ao controle</p>
        <h1>
          Do campo <span>ao controle.</span>
        </h1>
        <p className="hero-copy">
          Método de Wendell Lira, o brasileiro que venceu Messi no Puskás e
          virou pro em FIFA/EA FC. Leitura do futebol real aplicada no virtual,
          com trilhas de EA FC e eFootball, plano adaptativo e mentalidade de
          decisão.
        </p>
        <div className="hero-actions">
          <a className="pill-button" href="#diagnostico">
            Montar meu plano <ArrowUpRight size={17} />
          </a>
          <a className="outline-button" href="#trilhas">
            <Play size={15} fill="currentColor" /> Ver método
          </a>
        </div>
        <div className="hero-proof">
          <div className="proof-item">
            <strong>PUSKÁS</strong>
            <span>2015, 46,7% vs Messi</span>
          </div>
          <div className="proof-item">
            <strong>6x1</strong>
            <span>Vs campeão mundial em Zurique</span>
          </div>
          <div className="proof-item">
            <strong>{pricing.capacity}</strong>
            <span>Vagas por ciclo</span>
          </div>
        </div>
      </div>
    </section>
  );
}
