const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validPlayerId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function resolvePlayerId(value: unknown): string {
  return validPlayerId(value) ? value : crypto.randomUUID();
}

export function requirePlayerId(value: unknown): asserts value is string {
  if (!validPlayerId(value))
    throw new Error("Perfil inválido: esperado UUID v4.");
}
