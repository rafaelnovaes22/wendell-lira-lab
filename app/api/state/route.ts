import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensurePlayer, resetPlayer } from "@/lib/platform-store";
import { resolvePlayerId } from "@/lib/player-identity";
import { PLAYER_COOKIE, responseWithPlayer } from "@/lib/player-response";
import { publicFailure, requireSameOrigin } from "@/lib/http-contract";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const playerId = resolvePlayerId(cookieStore.get(PLAYER_COOKIE)?.value);
  const snapshot = await ensurePlayer(playerId);
  return responseWithPlayer(snapshot, playerId);
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    requireSameOrigin(request);
    const cookieStore = await cookies();
    const playerId = resolvePlayerId(cookieStore.get(PLAYER_COOKIE)?.value);
    const snapshot = await resetPlayer(playerId);
    return responseWithPlayer(snapshot, playerId);
  } catch (error) {
    const failure = publicFailure(error);
    return NextResponse.json(
      { error: failure.error },
      { status: failure.status },
    );
  }
}
