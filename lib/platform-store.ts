import { InputError } from "./input-error";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createPlayerProfile, createSeedPlatform } from "./seed-platform";
import { requirePlayerId } from "./player-identity";
import { recordPractice, visibleStreak } from "./practice-streak";
import type {
  AdminAction,
  PlatformState,
  PublicSnapshot,
  TrainingPlan,
  TrainingRequest,
} from "./pro-lab-types";

const stateDirectory =
  process.env.DATA_DIR ?? path.join(process.cwd(), ".runtime");
const statePath = path.join(stateDirectory, "wendell-lira-lab.json");
let writeQueue: Promise<unknown> = Promise.resolve();

async function persistState(state: PlatformState): Promise<void> {
  await mkdir(stateDirectory, { recursive: true });
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
  await rename(temporaryPath, statePath);
}

export async function readPlatformState(): Promise<PlatformState> {
  try {
    return JSON.parse(await readFile(statePath, "utf8")) as PlatformState;
  } catch (error) {
    const missingFile = (error as NodeJS.ErrnoException).code === "ENOENT";
    if (!missingFile) throw error;
    // Creation is written only by the serialized mutation queue.
    return createSeedPlatform();
  }
}

export function updatePlatformState<T>(
  mutate: (state: PlatformState) => T | Promise<T>,
): Promise<T> {
  const operation = writeQueue.then(async () => {
    const state = await readPlatformState();
    state.updatedAt = new Date().toISOString();
    const result = await mutate(state);
    await persistState(state);
    return result;
  });
  writeQueue = operation.catch(() => undefined);
  return operation;
}

export async function ensurePlayer(playerId: string): Promise<PublicSnapshot> {
  requirePlayerId(playerId);
  return updatePlatformState((state) => {
    state.players[playerId] ??= createPlayerProfile(playerId);
    return createPublicSnapshot(state, playerId);
  });
}

export async function saveTrainingPlan(
  playerId: string,
  request: TrainingRequest,
  plan: TrainingPlan,
): Promise<PublicSnapshot> {
  requirePlayerId(playerId);
  return updatePlatformState((state) => {
    const player = state.players[playerId] ?? createPlayerProfile(playerId);
    player.signals = {
      goal: request.goal,
      level: request.level,
      weeklyHours: request.weeklyHours,
      lastMood: request.mood,
      updatedAt: new Date().toISOString(),
    };
    player.lastPlan = plan;
    state.players[playerId] = player;
    state.telemetry.plansGenerated += 1;
    state.telemetry.checkIns += 1;
    player.statistics ??= { plansGenerated: 0, checkIns: 0, completions: 0 };
    player.statistics.plansGenerated += 1;
    player.statistics.checkIns += 1;
    return createPublicSnapshot(state, playerId);
  });
}

export async function completeLesson(
  playerId: string,
  lessonId: string,
  completedAt: Date = new Date(),
): Promise<PublicSnapshot> {
  requirePlayerId(playerId);
  return updatePlatformState((state) => {
    const player = state.players[playerId] ?? createPlayerProfile(playerId);
    const lesson = state.lessons.find((candidate) => candidate.id === lessonId);
    if (!lesson) throw new InputError(`Aula não encontrada: ${lessonId}`);
    if (!lesson.published || !lesson.videoUrl)
      throw new InputError("A aula ainda não foi publicada.");
    if (!player.completedLessonIds.includes(lessonId)) {
      player.completedLessonIds.push(lessonId);
      player.xp += lesson.xp;
      recordPractice(player, completedAt);
      player.division = divisionForXp(player.xp);
      state.telemetry.completions += 1;
    }
    state.players[playerId] = player;
    return createPublicSnapshot(state, playerId);
  });
}

export async function resetPlayer(playerId: string): Promise<PublicSnapshot> {
  requirePlayerId(playerId);
  return updatePlatformState((state) => {
    state.players[playerId] = createPlayerProfile(playerId);
    return createPublicSnapshot(state, playerId);
  });
}

export async function applyAdminAction(
  playerId: string,
  action: AdminAction,
): Promise<PublicSnapshot> {
  requirePlayerId(playerId);
  return updatePlatformState((state) => {
    if (action.type === "addLesson") addLesson(state, action.lesson);
    else if (action.type === "updatePricing") updatePricing(state, action);
    else if (action.type === "advancePrice") advancePrice(state);
    else throw new InputError("Ação administrativa inválida.");
    state.players[playerId] ??= createPlayerProfile(playerId);
    return createPublicSnapshot(state, playerId);
  });
}

function addLesson(
  state: PlatformState,
  lesson: Extract<AdminAction, { type: "addLesson" }>["lesson"],
): void {
  if (!lesson.title.trim()) throw new InputError("Informe o título da aula.");
  const trackExists = state.tracks.some((track) => track.id === lesson.trackId);
  if (!trackExists) throw new InputError(`Trilha inválida: ${lesson.trackId}`);
  state.lessons.unshift({
    ...lesson,
    title: lesson.title.trim().slice(0, 100),
    videoUrl: safeVideoUrl(lesson.videoUrl),
    durationMinutes: Math.max(
      1,
      Math.min(180, Math.round(lesson.durationMinutes)),
    ),
    xp: Math.max(10, Math.min(2000, Math.round(lesson.xp))),
    id: `${lesson.trackId}-${Date.now().toString(36)}`,
    thumbnail: "/tactical-desk.png",
    published: true,
  });
}

function safeVideoUrl(value: string | null): string {
  if (!value) throw new InputError("Informe o link do vídeo.");
  const parsed = new URL(value);
  if (parsed.protocol !== "https:")
    throw new InputError(`Link inseguro: ${value}`);
  return parsed.toString();
}

function updatePricing(
  state: PlatformState,
  action: Extract<AdminAction, { type: "updatePricing" }>,
): void {
  state.pricing.current = clampMoney(action.current);
  state.pricing.increaseStep = clampMoney(action.increaseStep);
  state.pricing.capacity = Math.max(1, Math.round(action.capacity));
  state.pricing.next = state.pricing.current + state.pricing.increaseStep;
}

function advancePrice(state: PlatformState): void {
  state.pricing.current = state.pricing.next;
  state.pricing.next = state.pricing.current + state.pricing.increaseStep;
  state.pricing.enrolled = 0;
}

function clampMoney(value: number): number {
  if (!Number.isFinite(value)) throw new InputError(`Valor inválido: ${value}`);
  return Math.max(0, Math.round(value));
}

function divisionForXp(xp: number): string {
  if (xp >= 3600) return "Pro League";
  if (xp >= 2200) return "Elite I";
  if (xp >= 1200) return "Elite II";
  if (xp >= 500) return "Competitiva I";
  return "Classificatória";
}

function createPublicSnapshot(
  state: PlatformState,
  playerId: string,
): PublicSnapshot {
  const player = state.players[playerId] ?? createPlayerProfile(playerId);
  return {
    updatedAt: state.updatedAt,
    tracks: state.tracks,
    lessons: state.lessons,
    pricing: state.pricing,
    profile: { ...player, streak: visibleStreak(player, new Date()) },
    metrics: {
      plansGenerated: player.statistics?.plansGenerated ?? 0,
      checkIns: player.statistics?.checkIns ?? 0,
      completions: player.completedLessonIds.length,
      activePlayers: 1,
    },
    mentorRadar: mentorRadarForMood(player.signals.lastMood),
  };
}

function mentorRadarForMood(mood?: string): PublicSnapshot["mentorRadar"] {
  if (mood === "ansioso" || mood === "frustrado") {
    return {
      dominantNeed: "Controle emocional sob pressão",
      suggestedMentoringFocus:
        "Revisar decisões após sofrer gol e praticar o protocolo de reset.",
    };
  }
  return {
    dominantNeed: "Leitura e consistência",
    suggestedMentoringFocus:
      "Validar o diagnóstico e escolher uma decisão-chave para a próxima sessão.",
  };
}
