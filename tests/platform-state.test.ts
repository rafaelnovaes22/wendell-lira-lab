import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createSeedPlatform, createPlayerProfile } from "../lib/seed-platform";
import { createAdaptivePlan } from "../lib/adaptive-coach";
import { recordPractice, visibleStreak } from "../lib/practice-streak";
import type { TrainingRequest } from "../lib/pro-lab-types";

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

test("plano só usa conteúdo publicado e distribui as 20 horas informadas", async () => {
  delete process.env.OPENAI_API_KEY;
  const state = createSeedPlatform();
  const player = createPlayerProfile(crypto.randomUUID());
  await assert.rejects(
    createAdaptivePlan(state, player, request),
    /publicou aulas/,
  );
  state.lessons[0] = {
    ...state.lessons[0],
    published: true,
    videoUrl: "https://example.com/aula",
  };
  const plan = await createAdaptivePlan(state, player, request);
  assert.deepEqual(
    plan.sessions.map((session) => session.lessonId),
    [state.lessons[0].id],
  );
  assert.equal(
    plan.sessions.reduce((total, session) => total + session.minutes, 0),
    1200,
  );
});

test("persistência concorrente isola perfis, limita conclusão e preserva outro aluno no reset", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "wendell-lira-state-"));
  process.env.DATA_DIR = directory;
  const store = await import("../lib/platform-store");
  const [first, second] = [crypto.randomUUID(), crypto.randomUUID()];
  try {
    await Promise.all([store.ensurePlayer(first), store.ensurePlayer(second)]);
    const initial = await store.readPlatformState();
    assert.deepEqual(
      Object.keys(initial.players).sort(),
      [first, second].sort(),
    );
    await assert.rejects(store.ensurePlayer("__proto__"));
    await assert.rejects(
      store.completeLesson(first, initial.lessons[0].id),
      /publicada/,
    );
    await store.updatePlatformState((state) => {
      state.lessons[0].published = true;
      state.lessons[0].videoUrl = "https://example.com/aula";
    });
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        store.completeLesson(first, initial.lessons[0].id),
      ),
    );
    assert.equal(results.at(-1)?.profile.xp, initial.lessons[0].xp);
    const plan = await createAdaptivePlan(
      await store.readPlatformState(),
      initial.players[first],
      request,
    );
    await store.saveTrainingPlan(first, request, plan);
    const own = await store.ensurePlayer(first);
    const other = await store.ensurePlayer(second);
    assert.equal(own.metrics.plansGenerated, 1);
    assert.equal(own.metrics.completions, 1);
    assert.equal(other.metrics.plansGenerated, 0);
    assert.equal(other.metrics.completions, 0);
    assert.equal(JSON.stringify(other).includes(first), false);
    await store.resetPlayer(second);
    assert.equal(
      (await store.ensurePlayer(first)).profile.xp,
      initial.lessons[0].xp,
    );
    assert.equal(
      JSON.parse(
        await readFile(path.join(directory, "wendell-lira-lab.json"), "utf8"),
      ).telemetry.completions,
      1,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
