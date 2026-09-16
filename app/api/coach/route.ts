import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { answerCoachChat, createAdaptivePlan } from "@/lib/adaptive-coach";
import { resolvePlayerId } from "@/lib/player-identity";
import { parseCoachPayload, type CoachPayload } from "@/lib/request-contract";
import { publicFailure, readJsonBody } from "@/lib/http-contract";
import { responseWithPlayer } from "@/lib/player-response";
import {
  ensurePlayer,
  readPlatformState,
  saveTrainingPlan,
} from "@/lib/platform-store";
import type { PlayerProfile } from "@/lib/pro-lab-types";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = parseCoachPayload(await readJsonBody(request));
    const cookieStore = await cookies();
    const playerId = resolvePlayerId(cookieStore.get("pro_lab_player")?.value);
    const snapshot = await ensurePlayer(playerId);
    const result = await createCoachResult(payload, playerId, snapshot.profile);
    return responseWithPlayer(result, playerId);
  } catch (error) {
    const failure = publicFailure(error);
    return NextResponse.json(
      { error: failure.error },
      { status: failure.status },
    );
  }
}

async function createCoachResult(
  payload: CoachPayload,
  playerId: string,
  profile: PlayerProfile,
): Promise<unknown> {
  const state = await readPlatformState();
  if (payload.mode === "chat") {
    if (!payload.message?.trim()) throw new Error("Escreva sua dúvida.");
    return {
      reply: await answerCoachChat(
        payload.message.trim().slice(0, 600),
        state,
        profile,
      ),
    };
  }
  const trainingRequest = payload;
  const plan = await createAdaptivePlan(state, profile, trainingRequest);
  const snapshot = await saveTrainingPlan(playerId, trainingRequest, plan);
  return { plan, snapshot };
}
