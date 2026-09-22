import { ArrowUpRight } from "lucide-react";
import { publicPath } from "@/lib/site-config";

export function Authority() {
  return (
    <section className="authority" aria-labelledby="authority-title">
      <div className="authority-image">
        <img
          src={publicPath("/tactical-desk.png")}
          alt="Mesa de análise tática com controle, headset e diagramas de campo"
          width={1536}
          height={1024}
          loading="lazy"
        />
      </div>
      <div className="authority-copy">
        <p className="eyebrow">Wendell Silva Lira, WL Puskás</p>
        <h2 id="authority-title">O gol mais bonito do mundo virou método.</h2>
        <p>
          Meia-bicicleta pelo Goianésia contra o Atlético-GO em 11/03/2015 no
          Serra Dourada, Puskás 2015 com 46,7% contra Messi e Florenzi. Ex
          atacante do Goiás, lesões, aposentadoria em 2016 no Vila Nova e
          virada: 6x1 contra o campeão mundial de FIFA em Zurique, Sporting CP
          nos esports, Netshoes Miners, Fluxo no EA FC, lives diárias na Kick e
          aposta atual no eFootball. O LAB transforma essa leitura do futebol
          real em treino de EA FC e eFootball.
        </p>
        <a
          className="pill-button"
          href="https://ge.globo.com/esports/ea-fc/noticia/2023/11/29/ea-fc-24-wendell-lira-e-anunciado-pelo-fluxo.ghtml"
          target="_blank"
          rel="noreferrer"
        >
          Conhecer a trajetória <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
