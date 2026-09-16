import { InputError } from "./input-error";

const MAX_BODY_BYTES = 16_384;

export function requireSameOrigin(request: Request): void {
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url)
    .origin;
  if (request.headers.get("origin") !== expected) {
    throw new InputError(
      "Origem da solicitação inválida. Reabra a página e tente novamente.",
      403,
    );
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  requireSameOrigin(request);
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    throw new InputError("Envie um objeto JSON.", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new InputError("Corpo JSON ausente.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new InputError("Solicitação excede 16 KB.", 413);
    }
    chunks.push(chunk.value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new InputError("Corpo JSON inválido.");
  }
}

export function publicFailure(error: unknown): {
  error: string;
  status: number;
} {
  if (error instanceof InputError)
    return { error: error.message, status: error.status };
  console.error(
    JSON.stringify({
      event: "request_failed",
      kind: error instanceof Error ? error.name : "Unknown",
    }),
  );
  return {
    error: "Não foi possível concluir agora. Tente novamente.",
    status: 500,
  };
}
