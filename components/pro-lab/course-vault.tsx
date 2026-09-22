"use client";

import { Check, LockKeyhole, Play } from "lucide-react";
import { useState } from "react";
import type { Lesson, PublicSnapshot } from "@/lib/pro-lab-types";
import { markLessonComplete } from "@/lib/platform-client";
import { publicPath } from "@/lib/site-config";

interface VaultProps {
  snapshot: PublicSnapshot;
  onSnapshot: (snapshot: PublicSnapshot) => void;
}

export function CourseVault({ snapshot, onSnapshot }: VaultProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function complete(lessonId: string): Promise<void> {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      onSnapshot(await markLessonComplete(lessonId));
    } catch {
      setError("Não foi possível registrar a aula. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="section" id="trilhas">
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Método WL</p>
            <h2 className="section-title">
              Uma trilha para cada{" "}
              <span className="outline-word">gargalo.</span>
            </h2>
          </div>
          <p className="section-note">
            Todo vídeo publicado pelo coach vira uma aula rastreável, entra na
            trilha certa e pode ser recomendado pela IA.
          </p>
        </div>
        <div className="track-grid">
          {snapshot.tracks.map((track) => (
            <article className="glass-panel track-card" key={track.id}>
              <span className="track-number">FASE {track.number}</span>
              <h3>{track.title}</h3>
              <p>{track.description}</p>
            </article>
          ))}
        </div>
        <div className="lesson-list">
          {error ? <p role="alert">{error}</p> : null}
          {snapshot.lessons.slice(0, 6).map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              completed={snapshot.profile.completedLessonIds.includes(
                lesson.id,
              )}
              onComplete={complete}
              pending={pending}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function LessonCard({
  lesson,
  completed,
  pending,
  onComplete,
}: {
  lesson: Lesson;
  completed: boolean;
  pending: boolean;
  onComplete: (id: string) => Promise<void>;
}) {
  return (
    <article className="glass-panel lesson-card">
      <div className="lesson-image">
        <img src={publicPath(lesson.thumbnail)} alt="" loading="lazy" />
      </div>
      <div className="lesson-body">
        <div>
          <div className="lesson-meta">
            <span>{lesson.durationMinutes} min</span>
            <span>+{lesson.xp} XP</span>
          </div>
          <h4>{lesson.title}</h4>
          <p>{lesson.focus}</p>
        </div>
        <div className="lesson-actions">
          {lesson.published && lesson.videoUrl ? (
            <a
              className="text-button"
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={14} /> Abrir aula
            </a>
          ) : (
            <span className="lesson-status">
              <LockKeyhole size={12} /> Vídeo do coach em breve
            </span>
          )}
          <button
            className="text-button"
            type="button"
            disabled={
              completed || pending || !lesson.published || !lesson.videoUrl
            }
            onClick={() => void onComplete(lesson.id)}
          >
            {completed ? (
              <>
                <Check size={14} /> Concluída
              </>
            ) : (
              "Marcar feita"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
