import assert from "node:assert/strict";
import test from "node:test";
import { resolvePlayerId, validPlayerId } from "../lib/player-identity";
import {
  parseAdminAction,
  parseCoachPayload,
  parseLessonId,
} from "../lib/request-contract";

const validPlan = {
  mode: "plan",
  goal: "Defender melhor",
  level: "elite",
  mood: "tranquilo",
  weeklyHours: 5,
};

test("cookie inválido nunca vira chave herdada e UUID válido é preservado", () => {
  for (const value of [
    undefined,
    "__proto__",
    "constructor",
    "prototype",
    "outro-perfil",
  ]) {
    assert.ok(validPlayerId(resolvePlayerId(value)));
  }
  const id = crypto.randomUUID();
  assert.equal(resolvePlayerId(id), id);
});

test("contrato rejeita modo, enums, textos e horas inválidos", () => {
  for (const payload of [
    null,
    [],
    {},
    { ...validPlan, mode: "invalid" },
    { ...validPlan, level: "admin" },
    { ...validPlan, mood: "__proto__" },
    { ...validPlan, goal: 17 },
    { ...validPlan, weeklyHours: NaN },
    { ...validPlan, weeklyHours: Infinity },
    { ...validPlan, weeklyHours: 0 },
  ]) {
    assert.throws(() => parseCoachPayload(payload));
  }
  assert.deepEqual(parseCoachPayload(validPlan), validPlan);
  assert.deepEqual(parseCoachPayload({ mode: "chat", message: " oi " }), {
    mode: "chat",
    message: "oi",
  });
});

test("admin não persiste capacidade não finita nem dados de aula inválidos", () => {
  const pricing = {
    type: "updatePricing",
    current: 100,
    increaseStep: 10,
    capacity: 8,
  };
  assert.deepEqual(parseAdminAction(pricing), pricing);
  assert.throws(() => parseAdminAction({ ...pricing, capacity: NaN }));
  assert.throws(() =>
    parseAdminAction({ type: "addLesson", lesson: { title: "Aula" } }),
  );
  assert.throws(() => parseLessonId({ lessonId: {} }));
});
