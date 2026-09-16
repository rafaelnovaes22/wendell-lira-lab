import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { applyAdminAction } from "@/lib/platform-store";
import { resolvePlayerId } from "@/lib/player-identity";
import { parseAdminAction } from "@/lib/request-contract";
import { InputError } from "@/lib/input-error";
import { publicFailure, readJsonBody } from "@/lib/http-contract";
import { responseWithPlayer } from "@/lib/player-response";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    requireAdminKey(request.headers.get("x-admin-key") ?? "");
    const action = parseAdminAction(await readJsonBody(request));
    const cookieStore = await cookies();
    const playerId = resolvePlayerId(cookieStore.get("pro_lab_player")?.value);
    const snapshot = await applyAdminAction(playerId, action);
    return responseWithPlayer(snapshot, playerId);
  } catch (error) {
    const failure = publicFailure(error);
    return NextResponse.json(
      { error: failure.error },
      { status: failure.status },
    );
  }
}

function requireAdminKey(received: string): void {
  const expected = process.env.COACH_ADMIN_KEY;
  if (!expected) {
    throw new InputError("Chave administrativa ainda não configurada.", 401);
  }
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  const sameLength = receivedBuffer.length === expectedBuffer.length;
  if (!sameLength || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    throw new InputError("Chave administrativa inválida.", 401);
  }
}
