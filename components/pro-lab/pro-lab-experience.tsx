"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicSnapshot } from "@/lib/pro-lab-types";
import { loadSnapshot, resetProgress } from "@/lib/platform-client";
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

  const loadSnapshotFromStorage = useCallback(
    (): Promise<void> =>
      loadSnapshot()
        .then((loaded) => {
          setSnapshot(loaded);
          setError("");
        })
        .catch((cause: unknown) => {
          setError(
            cause instanceof Error
              ? cause.message
              : "Arena temporariamente indisponível. Tente novamente.",
          );
        }),
    [],
  );

  useEffect(() => {
    void loadSnapshotFromStorage();
  }, [loadSnapshotFromStorage]);

  async function resetProgressInStorage(): Promise<void> {
    if (resetting) return;
    setResetting(true);
    setError("");
    try {
      setSnapshot(await resetProgress());
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
            <button
              className="pill-button"
              onClick={() => void loadSnapshotFromStorage()}
            >
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
        <CommandCenter snapshot={snapshot} />
        <Authority />
      </main>
      <Footer onReset={resetProgressInStorage} resetting={resetting} />
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
