import assert from "node:assert/strict";
import test from "node:test";
import {
  publicFailure,
  readJsonBody,
  requireSameOrigin,
} from "../lib/http-contract";

function request(body: string, origin = "http://localhost:4187"): Request {
  return new Request("http://localhost:4187/api/coach", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body,
  });
}

test("origem estrangeira, JSON inválido e corpo acima do limite são rejeitados", async () => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert.throws(() =>
    requireSameOrigin(request("{}", "https://outro.example")),
  );
  await assert.rejects(readJsonBody(request("{")), /JSON inválido/);
  await assert.rejects(
    readJsonBody(request(JSON.stringify({ message: "a".repeat(20_000) }))),
    /16 KB/,
  );
  assert.deepEqual(await readJsonBody(request('{"mode":"chat"}')), {
    mode: "chat",
  });
});

test("falha interna não revela caminhos nem segredo recebido", () => {
  const failure = publicFailure(new Error("/data/private.json token=privado"));
  assert.equal(failure.status, 500);
  assert.equal(failure.error.includes("privado"), false);
  assert.equal(failure.error.includes("/data"), false);
});
