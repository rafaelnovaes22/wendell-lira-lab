import assert from "node:assert/strict";
import test from "node:test";
import {
  answerCoachChat,
  createAdaptivePlan,
  crisisResponse,
  hasCrisisLanguage,
} from "../lib/adaptive-plan-core";
import { createPlayerProfile, createSeedPlatform } from "../lib/seed-platform";
import type { TrainingRequest } from "../lib/pro-lab-types";

const request: TrainingRequest = {
  goal: "Defender melhor",
  level: "elite",
  mood: "tranquilo",
  weeklyHours: 20,
};

test("plano só usa conteúdo publicado e distribui as 20 horas informadas", async () => {
  const state = createSeedPlatform();
  const player = createPlayerProfile(crypto.randomUUID());
  for (const lesson of state.lessons) {
    lesson.published = false;
    lesson.videoUrl = null;
  }
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

test("crise é detectada e responde com CVV e SAMU, sem tom de coach", async () => {
  assert.equal(hasCrisisLanguage("não quero viver mais"), true);
  assert.equal(hasCrisisLanguage("como melhorar meu ataque?"), false);
  const state = createSeedPlatform();
  const player = createPlayerProfile(crypto.randomUUID());
  const reply = await answerCoachChat("não quero viver", state, player);
  assert.equal(reply, crisisResponse());
  assert.match(reply, /CVV no 188/);
  assert.match(reply, /SAMU no 192/);
});

test("chat local recomenda aula publicada e pergunta sobre o estado do aluno", async () => {
  const state = createSeedPlatform();
  const player = createPlayerProfile(crypto.randomUUID());
  const reply = await answerCoachChat(
    "perco a cabeça quando tomo gol",
    state,
    player,
  );
  assert.match(reply, /Vamos simplificar/);
  assert.match(reply, /kick\.com\/wendelllira/);
});
