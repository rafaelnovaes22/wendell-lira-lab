import { InputError } from "./input-error";
import { createPlayerProfile, createSeedPlatform } from "./seed-platform";
import { requirePlayerId } from "./player-identity";
import { recordPractice } from "./practice-streak";
import { createPublicSnapshot, divisionForXp } from "./player-snapshot";
import type {
  PlatformState,
  PublicSnapshot,
  TrainingPlan,
  TrainingRequest,
} from "./pro-lab-types";

export const STATE_STORAGE_KEY = "wl-lab:state:v1";
export const PLAYER_STORAGE_KEY = "wl-lab:player:v1";

export interface BrowserPlatform {
  readPlatformState(): PlatformState;
  ensurePlayer(playerId: string): PublicSnapshot;
  saveTrainingPlan(
    playerId: string,
    request: TrainingRequest,
    plan: TrainingPlan,
  ): PublicSnapshot;
  completeLesson(
    playerId: string,
    lessonId: string,
    completedAt?: Date,
  ): PublicSnapshot;
  resetPlayer(playerId: string): PublicSnapshot;
}

// Persistência por jogador vive no navegador: cada visitante tem a própria
// arena em localStorage, sem servidor atrás do site estático.
export function createBrowserPlatform(storage: Storage): BrowserPlatform {
  function readPlatformState(): PlatformState {
    try {
      const stored = storage.getItem(STATE_STORAGE_KEY);
      return stored
        ? (JSON.parse(stored) as PlatformState)
        : createSeedPlatform();
    } catch {
      // Estado corrompido volta ao seed em vez de travar o produto.
      return createSeedPlatform();
    }
  }

  function persistState(state: PlatformState): void {
    storage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
  }

  function updatePlatformState<T>(mutate: (state: PlatformState) => T): {
    state: PlatformState;
    result: T;
  } {
    const state = readPlatformState();
    state.updatedAt = new Date().toISOString();
    const result = mutate(state);
    persistState(state);
    return { state, result };
  }

  function snapshotFor(state: PlatformState, playerId: string) {
    return createPublicSnapshot(state, playerId);
  }

  return {
    readPlatformState,
    ensurePlayer(playerId: string): PublicSnapshot {
      requirePlayerId(playerId);
      const { state } = updatePlatformState((current) => {
        current.players[playerId] ??= createPlayerProfile(playerId);
      });
      return snapshotFor(state, playerId);
    },
    saveTrainingPlan(
      playerId: string,
      request: TrainingRequest,
      plan: TrainingPlan,
    ): PublicSnapshot {
      requirePlayerId(playerId);
      const { state } = updatePlatformState((current) => {
        const player =
          current.players[playerId] ?? createPlayerProfile(playerId);
        player.signals = {
          goal: request.goal,
          level: request.level,
          weeklyHours: request.weeklyHours,
          lastMood: request.mood,
          updatedAt: new Date().toISOString(),
        };
        player.lastPlan = plan;
        current.players[playerId] = player;
        player.statistics ??= {
          plansGenerated: 0,
          checkIns: 0,
          completions: 0,
        };
        player.statistics.plansGenerated += 1;
        player.statistics.checkIns += 1;
        return player;
      });
      return snapshotFor(state, playerId);
    },
    completeLesson(
      playerId: string,
      lessonId: string,
      completedAt: Date = new Date(),
    ): PublicSnapshot {
      requirePlayerId(playerId);
      const { state } = updatePlatformState((current) => {
        const player =
          current.players[playerId] ?? createPlayerProfile(playerId);
        const lesson = current.lessons.find(
          (candidate) => candidate.id === lessonId,
        );
        if (!lesson) throw new InputError(`Aula não encontrada: ${lessonId}`);
        if (!lesson.published || !lesson.videoUrl)
          throw new InputError("A aula ainda não foi publicada.");
        if (!player.completedLessonIds.includes(lessonId)) {
          player.completedLessonIds.push(lessonId);
          player.xp += lesson.xp;
          recordPractice(player, completedAt);
          player.division = divisionForXp(player.xp);
          current.telemetry.completions += 1;
        }
        current.players[playerId] = player;
        return player;
      });
      return snapshotFor(state, playerId);
    },
    resetPlayer(playerId: string): PublicSnapshot {
      requirePlayerId(playerId);
      const { state } = updatePlatformState((current) => {
        current.players[playerId] = createPlayerProfile(playerId);
      });
      return snapshotFor(state, playerId);
    },
  };
}
