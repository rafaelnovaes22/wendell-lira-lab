import { NextResponse } from "next/server";

export const PLAYER_COOKIE = "pro_lab_player";

export function responseWithPlayer(
  payload: unknown,
  playerId: string,
): NextResponse {
  const response = NextResponse.json(payload, {
    headers: { "Cache-Control": "private, no-store" },
  });
  response.cookies.set(PLAYER_COOKIE, playerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
