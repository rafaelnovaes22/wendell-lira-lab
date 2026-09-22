"use client";

import { BrainCircuit, Flame, Trophy } from "lucide-react";
import type { PublicSnapshot } from "@/lib/pro-lab-types";

export function CommandCenter({ snapshot }: { snapshot: PublicSnapshot }) {
  return (
    <section className="section" id="gestao">
      <div className="shell command-shell">
        <div className="command-inner">
          <div className="command-grid">
            <CommandOverview snapshot={snapshot} />
            <div className="command-panel">
              <p className="eyebrow">Protocolo Puskás</p>
              <h3>Rotina de campeão, resumida.</h3>
              <p className="fine-print">
                A rotina que levou do Serra Dourada ao Mundial: leitura antes do
                comando, sessão com um objetivo único e review curto sem
                desculpa.
              </p>
              <div className="command-kpis">
                <RoutineKpi
                  icon={<BrainCircuit size={24} />}
                  label="Diagnóstico"
                  value="1 decisão por sessão"
                />
                <RoutineKpi
                  icon={<Flame size={24} />}
                  label="Reset emocional"
                  value="40 segundos"
                />
                <RoutineKpi
                  icon={<Trophy size={24} />}
                  label="Review"
                  value="2 minutos"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommandOverview({ snapshot }: { snapshot: PublicSnapshot }) {
  return (
    <div className="command-panel">
      <p className="eyebrow">Seu command center</p>
      <h3>Menos gestão. Mais mentoria.</h3>
      <p className="fine-print">
        Este resumo mostra somente o seu progresso, salvo neste navegador, e o
        que treinar agora.
      </p>
      <div className="command-kpis">
        <Kpi value={String(snapshot.metrics.checkIns)} label="Seus check-ins" />
        <Kpi
          value={String(snapshot.metrics.plansGenerated)}
          label="Planos gerados"
        />
        <Kpi
          value={String(snapshot.metrics.completions)}
          label="Aulas concluídas"
        />
        <Kpi value={money(snapshot.pricing.next)} label="Próximo ticket" />
      </div>
      <div className="coach-note">
        <strong>Sugestão para sua próxima revisão</strong>
        <br />
        {snapshot.mentorRadar.dominantNeed}:{" "}
        {snapshot.mentorRadar.suggestedMentoringFocus}
      </div>
    </div>
  );
}

function RoutineKpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="command-kpi">
      <span className="micro-label">{label}</span>
      {icon}
      <strong>{value}</strong>
    </div>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="command-kpi">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function money(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
