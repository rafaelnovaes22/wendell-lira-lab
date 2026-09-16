import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { completeLesson } from "@/lib/platform-store";
import { resolvePlayerId } from "@/lib/player-identity";
import { parseLessonId } from "@/lib/request-contract";
import { publicFailure, readJsonBody } from "@/lib/http-contract";
import { responseWithPlayer } from "@/lib/player-response";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const lessonId = parseLessonId(await readJsonBody(request));
    const cookieStore = await cookies();
    const playerId = resolvePlayerId(cookieStore.get("pro_lab_player")?.value);
    const snapshot = await completeLesson(playerId, lessonId);
    return responseWithPlayer(snapshot, playerId);
  } catch (error) {
    const failure = publicFailure(error);
    return NextResponse.json(
      { error: failure.error },
      { status: failure.status },
    );
  }
}
