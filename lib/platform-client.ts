import { answerCoachChat, createAdaptivePlan } from "./adaptive-plan-core";
import { createBrowserPlatform, PLAYER_STORAGE_KEY } from "./browser-platform";
import { InputError } from "./input-error";
import { resolvePlayerId } from "./player-identity";
import {
  parseCoachPayload,
  parseLessonId,
  type CoachPayload,
} from "./request-contract";
import type { PublicSnapshot, TrainingRequest } from "./pro-lab-types";

const GENERIC_FAILURE = "Não foi possível concluir agora. Tente novamente.";

function browserStorage(): Storage {
  try {
    return window.localStorage;
  } catch {
    // Modo privado com storage bloqueado não deve fingir progresso salvo.
    throw new Error(
      "Este navegador bloqueou o armazenamento local. O progresso não será salvo.",
    );
  }
}

function currentPlayerId(): string {
  const stored = window.localStorage.getItem(PLAYER_STORAGE_KEY);
  const playerId = resolvePlayerId(stored);
  if (playerId !== stored)
    window.localStorage.setItem(PLAYER_STORAGE_KEY, playerId);
  return playerId;
}

function failure(cause: unknown): Error {
  if (cause instanceof InputError) return new Error(cause.message);
  if (cause instanceof Error) return cause;
  return new Error(GENERIC_FAILURE);
}

export async function loadSnapshot(): Promise<PublicSnapshot> {
  try {
    return createBrowserPlatform(browserStorage()).ensurePlayer(
      currentPlayerId(),
    );
  } catch (cause) {
    throw failure(cause);
  }
}

export async function resetProgress(): Promise<PublicSnapshot> {
  try {
    return createBrowserPlatform(browserStorage()).resetPlayer(
      currentPlayerId(),
    );
  } catch (cause) {
    throw failure(cause);
  }
}

export async function generatePlan(
  request: TrainingRequest,
): Promise<PublicSnapshot> {
  try {
    const payload: CoachPayload = parseCoachPayload({
      mode: "plan",
      ...request,
    });
    if (payload.mode !== "plan") throw new Error("Payload inválido.");
    const store = createBrowserPlatform(browserStorage());
    const playerId = currentPlayerId();
    // ensurePlayer garante o perfil antes de o coach ler os sinais.
    const snapshot = store.ensurePlayer(playerId);
    const plan = await createAdaptivePlan(
      store.readPlatformState(),
      snapshot.profile,
      payload,
    );
    return store.saveTrainingPlan(playerId, payload, plan);
  } catch (cause) {
    throw failure(cause);
  }
}

export async function sendChat(message: string): Promise<string> {
  try {
    const payload = parseCoachPayload({ mode: "chat", message });
    if (payload.mode !== "chat") throw new Error("Payload inválido.");
    const store = createBrowserPlatform(browserStorage());
    const snapshot = store.ensurePlayer(currentPlayerId());
    return answerCoachChat(
      payload.message.trim().slice(0, 600),
      store.readPlatformState(),
      snapshot.profile,
    );
  } catch (cause) {
    throw failure(cause);
  }
}

export async function markLessonComplete(
  lessonId: string,
): Promise<PublicSnapshot> {
  try {
    const parsed = parseLessonId({ lessonId });
    return createBrowserPlatform(browserStorage()).completeLesson(
      currentPlayerId(),
      parsed,
    );
  } catch (cause) {
    throw failure(cause);
  }
}
