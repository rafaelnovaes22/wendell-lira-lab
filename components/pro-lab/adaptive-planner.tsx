"use client";

import { BrainCircuit, ChevronRight } from "lucide-react";
import { useState } from "react";
import type {
  PlayerLevel,
  PlayerMood,
  PublicSnapshot,
  TrainingPlan,
} from "@/lib/pro-lab-types";

interface PlannerProps {
  snapshot: PublicSnapshot;
  onSnapshot: (snapshot: PublicSnapshot) => void;
}

export function AdaptivePlanner({ snapshot, onSnapshot }: PlannerProps) {
  const [goal, setGoal] = useState("Tomar melhores decisões sob pressão");
  const [level, setLevel] = useState<PlayerLevel>(
    snapshot.profile.signals.level,
  );
  const [mood, setMood] = useState<PlayerMood>(
    snapshot.profile.signals.lastMood,
  );
  const [weeklyHours, setWeeklyHours] = useState(
    snapshot.profile.signals.weeklyHours,
  );
  const plan = snapshot.profile.lastPlan;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generatePlan() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "plan",
          goal,
          level,
          mood,
          weeklyHours,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Plano indisponível.");
      onSnapshot(result.snapshot as PublicSnapshot);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível gerar o plano.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" id="diagnostico">
      <div className="shell">
        <SectionHeading />
        <div className="planner-grid">
          <div className="glass-panel form-panel">
            <GoalField value={goal} onChange={setGoal} />
            <ChoiceField
              label="Seu nível hoje"
              values={["competitivo", "elite", "pro"]}
              selected={level}
              onSelect={(value) => setLevel(value as PlayerLevel)}
            />
            <ChoiceField
              label="Como você chega para treinar?"
              values={["tranquilo", "ansioso", "frustrado", "confiante"]}
              selected={mood}
              onSelect={(value) => setMood(value as PlayerMood)}
            />
            <div className="field-group">
              <label htmlFor="hours">Tempo real por semana</label>
              <div className="range-row">
                <input
                  id="hours"
                  type="range"
                  min="2"
                  max="20"
                  value={weeklyHours}
                  onChange={(event) =>
                    setWeeklyHours(Number(event.target.value))
                  }
                />
                <span className="range-value">{weeklyHours}H</span>
              </div>
            </div>
            <button
              className="pill-button"
              type="button"
              disabled={loading}
              onClick={() => void generatePlan()}
            >
              {loading ? "Lendo seu jogo" : "Criar plano de evolução"}
              <BrainCircuit size={17} />
            </button>
            {error ? (
              <p className="admin-status" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <div className="glass-panel result-panel">
            {plan ? (
              <PlanResult plan={plan} snapshot={snapshot} />
            ) : (
              <PlanEmpty />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading() {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">Diagnóstico vivo</p>
        <h2 className="section-title">
          Seu jogo pede um <span className="outline-word">plano único.</span>
        </h2>
      </div>
      <p className="section-note">
        Organize objetivos, estado competitivo e progresso neste navegador. Os
        planos usam somente aulas já publicadas pelo coach.
      </p>
    </div>
  );
}

function GoalField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label htmlFor="goal">O que precisa mudar no seu jogo?</label>
      <textarea
        className="field-area"
        id="goal"
        maxLength={240}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ChoiceField({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <span className="micro-label">{label}</span>
      <div className="choice-row">
        {values.map((value) => (
          <button
            className={`choice-chip ${selected === value ? "is-active" : ""}`}
            type="button"
            key={value}
            onClick={() => onSelect(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlanEmpty() {
  return (
    <div className="result-empty">
      <div>
        <div className="radar-orbit">
          <span className="radar-line" />
        </div>
        <p className="micro-label">Coach intelligence</p>
        <h3 className="card-title">Pronto para ler seu jogo</h3>
        <p className="fine-print">
          Responda ao diagnóstico. O plano aponta aulas, carga e protocolo
          emocional para esta semana.
        </p>
      </div>
    </div>
  );
}

function PlanResult({
  plan,
  snapshot,
}: {
  plan: TrainingPlan;
  snapshot: PublicSnapshot;
}) {
  return (
    <div>
      <div className="plan-header">
        <span className="micro-label">Plano ativo</span>
        <h3>{plan.headline}</h3>
        <p>Foco: {plan.weeklyFocus}</p>
      </div>
      <div className="plan-sessions">
        {plan.sessions.map((session) => {
          const lesson = snapshot.lessons.find(
            (candidate) => candidate.id === session.lessonId,
          );
          return (
            <div className="session-row" key={session.lessonId}>
              <span className="session-day">{session.day}</span>
              <div>
                <strong>{lesson?.title ?? session.objective}</strong>
                <small>
                  {session.minutes} min, {lesson?.xp ?? 0} XP
                </small>
              </div>
              <ChevronRight size={18} />
            </div>
          );
        })}
      </div>
      <div className="coach-note">
        <strong>Leitura do Coach WL AI</strong>
        <br />
        {plan.coachNote}
      </div>
      <p className="fine-print">
        <strong>Reset:</strong> {plan.recoveryProtocol}
      </p>
    </div>
  );
}
