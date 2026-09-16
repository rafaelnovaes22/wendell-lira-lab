"use client";

import { ArrowUpRight, BrainCircuit, Video } from "lucide-react";
import { useState } from "react";
import type { PublicSnapshot } from "@/lib/pro-lab-types";

interface CommandProps {
  snapshot: PublicSnapshot;
  onSnapshot: (snapshot: PublicSnapshot) => void;
}

export function CommandCenter({ snapshot, onSnapshot }: CommandProps) {
  const [adminKey, setAdminKey] = useState("");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [trackId, setTrackId] = useState(
    snapshot.tracks[0]?.id ?? "game-reading",
  );
  const [current, setCurrent] = useState(snapshot.pricing.current);
  const [increaseStep, setIncreaseStep] = useState(
    snapshot.pricing.increaseStep,
  );
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function runAction(action: unknown, successMessage: string) {
    if (busy) return;
    setBusy(true);
    setStatus("Executando...");
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(action),
      });
      const result = await response.json();
      if (!response.ok) {
        setStatus(result.error ?? "Operação não concluída.");
        return;
      }
      onSnapshot(result as PublicSnapshot);
      setStatus(successMessage);
    } catch {
      setStatus(
        "Não foi possível concluir. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section" id="gestao">
      <div className="shell command-shell">
        <div className="command-inner">
          <div className="command-grid">
            <CommandOverview snapshot={snapshot} />
            <div className="command-panel">
              <div className="field-group">
                <label htmlFor="admin-key">Chave privada do coach</label>
                <input
                  id="admin-key"
                  className="field"
                  type="password"
                  autoComplete="off"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  placeholder="Apenas para ações de gestão"
                />
              </div>
              <fieldset
                className="admin-forms"
                disabled={busy}
                style={{ border: 0, margin: 0, padding: 0 }}
              >
                <VideoForm
                  snapshot={snapshot}
                  title={title}
                  videoUrl={videoUrl}
                  trackId={trackId}
                  onTitle={setTitle}
                  onVideoUrl={setVideoUrl}
                  onTrack={setTrackId}
                  onPublish={() =>
                    runAction(
                      {
                        type: "addLesson",
                        lesson: {
                          title,
                          videoUrl,
                          trackId,
                          focus: "a definir pelo coach",
                          durationMinutes: 20,
                          xp: 250,
                        },
                      },
                      "Vídeo publicado e conectado à trilha.",
                    )
                  }
                />
                <PricingForm
                  snapshot={snapshot}
                  current={current}
                  increaseStep={increaseStep}
                  onCurrent={setCurrent}
                  onIncrease={setIncreaseStep}
                  onSave={() =>
                    runAction(
                      {
                        type: "updatePricing",
                        current,
                        increaseStep,
                        capacity: snapshot.pricing.capacity,
                      },
                      "Escada de valor atualizada.",
                    )
                  }
                  onAdvance={() =>
                    runAction(
                      { type: "advancePrice" },
                      "Novo ciclo e novo ticket ativados.",
                    )
                  }
                />
              </fieldset>
              <p className="admin-status" role="status">
                {status}
              </p>
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
      <p className="eyebrow">Coach command center</p>
      <h3>Menos gestão. Mais mentoria.</h3>
      <p className="fine-print">
        Este resumo mostra somente seu perfil. As ações de publicação e preço
        exigem a chave privada do coach.
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

interface VideoFormProps {
  snapshot: PublicSnapshot;
  title: string;
  videoUrl: string;
  trackId: string;
  onTitle: (value: string) => void;
  onVideoUrl: (value: string) => void;
  onTrack: (value: string) => void;
  onPublish: () => Promise<void>;
}

function VideoForm(props: VideoFormProps) {
  return (
    <div className="admin-card">
      <Video size={20} />
      <h4>Publicar vídeo</h4>
      <div className="field-group">
        <label htmlFor="lesson-title">Título</label>
        <input
          id="lesson-title"
          className="field"
          value={props.title}
          onChange={(event) => props.onTitle(event.target.value)}
        />
      </div>
      <div className="field-group">
        <label htmlFor="video-url">YouTube, Vimeo ou Kick</label>
        <input
          id="video-url"
          className="field"
          type="url"
          value={props.videoUrl}
          onChange={(event) => props.onVideoUrl(event.target.value)}
        />
      </div>
      <div className="field-group">
        <label htmlFor="track">Trilha correspondente</label>
        <select
          id="track"
          className="field-select"
          value={props.trackId}
          onChange={(event) => props.onTrack(event.target.value)}
        >
          {props.snapshot.tracks.map((track) => (
            <option value={track.id} key={track.id}>
              {track.title}
            </option>
          ))}
        </select>
      </div>
      <button
        className="outline-button"
        type="button"
        onClick={() => void props.onPublish()}
      >
        Publicar <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

interface PricingFormProps {
  snapshot: PublicSnapshot;
  current: number;
  increaseStep: number;
  onCurrent: (value: number) => void;
  onIncrease: (value: number) => void;
  onSave: () => Promise<void>;
  onAdvance: () => Promise<void>;
}

function PricingForm(props: PricingFormProps) {
  return (
    <div className="admin-card">
      <BrainCircuit size={20} />
      <h4>Escada de valor</h4>
      <div className="field-group">
        <label htmlFor="current-price">Ticket atual</label>
        <input
          id="current-price"
          className="field"
          type="number"
          value={props.current}
          onChange={(event) => props.onCurrent(Number(event.target.value))}
        />
      </div>
      <div className="field-group">
        <label htmlFor="price-step">Aumento por ciclo</label>
        <input
          id="price-step"
          className="field"
          type="number"
          value={props.increaseStep}
          onChange={(event) => props.onIncrease(Number(event.target.value))}
        />
      </div>
      <button
        className="outline-button"
        type="button"
        onClick={() => void props.onSave()}
      >
        Salvar preços
      </button>
      <button
        className="text-button"
        type="button"
        onClick={() => void props.onAdvance()}
      >
        Abrir próximo ciclo em {money(props.snapshot.pricing.next)}
      </button>
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
