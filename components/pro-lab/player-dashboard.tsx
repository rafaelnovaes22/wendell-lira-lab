"use client";

import { Flame, Goal, ScanLine, Trophy } from "lucide-react";
import type { PublicSnapshot } from "@/lib/pro-lab-types";

export function PlayerDashboard({ snapshot }: { snapshot: PublicSnapshot }) {
  const { profile } = snapshot;
  const progress = Math.min(100, Math.round((profile.xp / 3600) * 100));
  return (
    <section className="section" aria-labelledby="journey-title">
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sua temporada</p>
            <h2 className="section-title" id="journey-title">
              Evolução que você{" "}
              <span className="outline-word">consegue ver.</span>
            </h2>
          </div>
          <p className="section-note">
            XP registra as aulas que você marcou como concluídas. O progresso
            pertence a este navegador e pode ser reiniciado no rodapé.
          </p>
        </div>
        <div className="dashboard-grid">
          <article className="glass-panel metric-card is-rank">
            <span className="micro-label">Divisão atual</span>
            <strong>{profile.division}</strong>
            <small>{profile.xp} / 3.600 XP para Pro League</small>
            <div className="xp-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </article>
          <MetricCard
            label="Sequência"
            value={`${profile.streak} dias`}
            detail="Consistência antes de intensidade"
            icon={<Flame size={24} />}
          />
          <MetricCard
            label="Aulas concluídas"
            value={String(profile.completedLessonIds.length)}
            detail="Conclusão informada por você"
            icon={<Trophy size={24} />}
          />
        </div>
        <div className="mission-strip">
          <Mission
            icon={<ScanLine size={20} />}
            title="1 decisão por replay"
            detail="Missão de leitura"
          />
          <Mission
            icon={<Goal size={20} />}
            title="2 partidas sem fila rápida"
            detail="Missão de controle"
          />
          <Mission
            icon={<Flame size={20} />}
            title="Reset de 40 segundos"
            detail="Missão de mentalidade"
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="glass-panel metric-card">
      <span className="micro-label">{label}</span>
      {icon}
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function Mission({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="mission-card">
      <span className="mission-icon">{icon}</span>
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}
