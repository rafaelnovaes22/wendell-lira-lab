import assert from "node:assert/strict";
import test from "node:test";
import { createPlayerProfile, createSeedPlatform } from "../lib/seed-platform";
import { recordPractice, visibleStreak } from "../lib/practice-streak";
import {
  createBrowserPlatform,
  STATE_STORAGE_KEY,
} from "../lib/browser-platform";
import { createAdaptivePlan } from "../lib/adaptive-plan-core";
import type { TrainingRequest } from "../lib/pro-lab-types";

class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>();

  get length(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }

  key(index: number): string | null {
    return [...this.items.keys()][index] ?? null;
  }

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }
}

const request: TrainingRequest = {
  goal: "Defender melhor",
  level: "elite",
  mood: "tranquilo",
  weeklyHours: 20,
};

test("sequência conta dias em São Paulo, expira e reinicia após uma pausa", () => {
  const player = createPlayerProfile(crypto.randomUUID());
  recordPractice(player, new Date("2026-09-01T23:00:00-03:00"));
  recordPractice(player, new Date("2026-09-01T23:59:00-03:00"));
  assert.equal(player.streak, 1);
  recordPractice(player, new Date("2026-09-02T00:01:00-03:00"));
  assert.equal(player.streak, 2);
  assert.equal(visibleStreak(player, new Date("2026-09-04T12:00:00-03:00")), 0);
  recordPractice(player, new Date("2026-09-04T12:00:00-03:00"));
  assert.equal(player.streak, 1);
});

test("arena local isola perfis, limita conclusão e preserva o outro aluno no reset", async () => {
  const storage = new MemoryStorage();
  const platform = createBrowserPlatform(storage);
  const [first, second] = [crypto.randomUUID(), crypto.randomUUID()];

  platform.ensurePlayer(first);
  platform.ensurePlayer(second);
  const initial = platform.readPlatformState();
  assert.deepEqual(Object.keys(initial.players).sort(), [first, second].sort());
  assert.throws(() => platform.ensurePlayer("__proto__"));
  assert.throws(
    () => platform.completeLesson(first, "aula-inexistente"),
    /Aula não encontrada/,
  );
  const results = Array.from({ length: 8 }, () =>
    platform.completeLesson(first, initial.lessons[0].id),
  );
  assert.equal(results.at(-1)?.profile.xp, initial.lessons[0].xp);
  const plan = await createAdaptivePlan(
    platform.readPlatformState(),
    initial.players[first],
    request,
  );
  const own = platform.saveTrainingPlan(first, request, plan);
  const other = platform.ensurePlayer(second);
  assert.equal(own.metrics.plansGenerated, 1);
  assert.equal(own.metrics.completions, 1);
  assert.equal(other.metrics.plansGenerated, 0);
  assert.equal(other.metrics.completions, 0);
  assert.equal(JSON.stringify(other).includes(first), false);
  platform.resetPlayer(second);
  assert.equal(platform.ensurePlayer(first).profile.xp, initial.lessons[0].xp);
  const persisted = JSON.parse(storage.getItem(STATE_STORAGE_KEY) ?? "{}") as {
    telemetry: { completions: number };
  };
  assert.equal(persisted.telemetry.completions, 1);
});

test("estado salvo é recarregado e estado corrompido volta ao seed", () => {
  const storage = new MemoryStorage();
  const platform = createBrowserPlatform(storage);
  const playerId = crypto.randomUUID();
  platform.ensurePlayer(playerId);
  const reloaded = createBrowserPlatform(storage);
  assert.equal(reloaded.readPlatformState().players[playerId].xp, 0);
  storage.setItem(STATE_STORAGE_KEY, "{json inválido");
  const corrupted = createBrowserPlatform(storage);
  assert.deepEqual(
    corrupted.readPlatformState().lessons.map((lesson) => lesson.id),
    createSeedPlatform().lessons.map((lesson) => lesson.id),
  );
});
