import { InputError } from "./input-error";
import type { PlayerLevel, PlayerMood, TrainingRequest } from "./pro-lab-types";

export type CoachPayload =
  ({ mode: "plan" } & TrainingRequest) | { mode: "chat"; message: string };
const LEVELS: PlayerLevel[] = ["competitivo", "elite", "pro"];
const MOODS: PlayerMood[] = ["tranquilo", "ansioso", "frustrado", "confiante"];

function objectPayload(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InputError("Corpo inválido: esperado objeto JSON.");
  }
  return value as Record<string, unknown>;
}

function requiredText(value: unknown, label: string, maximum: number): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.trim().length > maximum
  ) {
    throw new InputError(`${label}: informe de 1 a ${maximum} caracteres.`);
  }
  return value.trim();
}

function boundedNumber(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new InputError(
      `${label}: esperado número entre ${minimum} e ${maximum}.`,
    );
  }
  return value;
}

export function parseCoachPayload(value: unknown): CoachPayload {
  const payload = objectPayload(value);
  if (payload.mode === "chat")
    return {
      mode: "chat",
      message: requiredText(payload.message, "Mensagem", 600),
    };
  if (payload.mode !== "plan")
    throw new InputError("Modo inválido: esperado plan ou chat.");
  if (!LEVELS.includes(payload.level as PlayerLevel))
    throw new InputError("Nível inválido.");
  if (!MOODS.includes(payload.mood as PlayerMood))
    throw new InputError("Estado de treino inválido.");
  return {
    mode: "plan",
    goal: requiredText(payload.goal, "Objetivo", 240),
    level: payload.level as PlayerLevel,
    mood: payload.mood as PlayerMood,
    weeklyHours: boundedNumber(payload.weeklyHours, "Horas semanais", 2, 20),
  };
}

export function parseLessonId(value: unknown): string {
  return requiredText(objectPayload(value).lessonId, "Aula", 100);
}
