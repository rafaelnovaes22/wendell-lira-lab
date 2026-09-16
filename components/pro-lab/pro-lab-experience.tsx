"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicSnapshot } from "@/lib/pro-lab-types";
import { AdaptivePlanner } from "./adaptive-planner";
import { Authority } from "./authority";
import { CommandCenter } from "./command-center";
import { CourseVault } from "./course-vault";
import { Hero } from "./hero";
import { PerformanceSupport } from "./performance-support";
import { PlayerDashboard } from "./player-dashboard";
import { SiteHeader } from "./site-header";

export function ProLabExperience() {
  const [snapshot, setSnapshot] = useState<PublicSnapshot | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [resetting, setResetting] = useState(false);

  const loadSnapshot = useCallback((): Promise<void> =>
    fetch("/api/state", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao abrir sua arena.");
        setSnapshot((await response.json()) as PublicSnapshot);
        setError("");
      })
      .catch(() => { setError("Arena temporariamente indisponível. Tente novamente."); }), []);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  async function resetProgress(): Promise<void> {
    if (resetting) return;
    setResetting(true);
    setError("");
    try {
      const response = await fetch("/api/state", { method: "DELETE" });
      if (!response.ok)
        throw new Error("Não foi possível reiniciar o progresso.");
      setSnapshot((await response.json()) as PublicSnapshot);
      setRevision((current) => current + 1);
    } catch {
      setError("Não foi possível reiniciar o progresso. Tente novamente.");
    } finally {
      setResetting(false);
    }
  }

  if (!snapshot) {
    return (
      <div className="loading-screen">
        <div className="loading-lockup">WL LIRA LAB</div>
        {error ? (
          <div role="alert">
            <p>{error}</p>
            <button className="pill-button" onClick={() => void loadSnapshot()}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <p role="status">Abrindo sua arena...</p>
        )}
      </div>
    );
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">
        <Hero pricing={snapshot.pricing} />
        <Ticker />
        <AdaptivePlanner
          key={`planner-${revision}`}
          snapshot={snapshot}
          onSnapshot={setSnapshot}
        />
        <PlayerDashboard snapshot={snapshot} />
        <CourseVault snapshot={snapshot} onSnapshot={setSnapshot} />
        <PerformanceSupport
          key={`chat-${revision}`}
          profile={snapshot.profile}
        />
        <CommandCenter snapshot={snapshot} onSnapshot={setSnapshot} />
        <Authority />
      </main>
      <Footer onReset={resetProgress} resetting={resetting} />
      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}
    </>
  );
}

function Ticker() {
  const terms = [
    "Puskás 2015",
    "Do campo ao controle",
    "EA FC",
    "eFootball",
    "Leitura real no virtual",
    "Lirismo",
  ];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[...terms, ...terms].map((term, index) => (
          <span key={`${term}-${index}`}>{term}</span>
        ))}
      </div>
    </div>
  );
}

function Footer({
  onReset,
  resetting,
}: {
  onReset: () => Promise<void>;
  resetting: boolean;
}) {
  return (
    <footer className="site-footer">
      <div className="shell footer-row">
        <div className="brand-lockup">
          <span className="brand-mark">WL</span>
          <span>WENDELL LIRA LAB</span>
        </div>
        <p>
          Coach WL AI apoia performance e organização de treino em EA FC e
          eFootball. Não substitui acompanhamento psicológico ou médico.
        </p>
        <button
          className="text-button"
          type="button"
          disabled={resetting}
          onClick={() => void onReset()}
        >
          {resetting ? "Reiniciando..." : "Reiniciar meu progresso"}
        </button>
      </div>
    </footer>
  );
}
