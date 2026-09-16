import type { PlayerProfile } from "./pro-lab-types";

function dayKey(moment: Date): string {
  return moment.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function visibleStreak(player: PlayerProfile, moment: Date): number {
  if (!player.lastPracticeDate) return 0;
  const gap = Date.parse(dayKey(moment)) - Date.parse(player.lastPracticeDate);
  return gap > 86_400_000 ? 0 : player.streak;
}

export function recordPractice(player: PlayerProfile, moment: Date): void {
  const today = dayKey(moment);
  if (player.lastPracticeDate === today) return;
  const gap = Date.parse(today) - Date.parse(player.lastPracticeDate ?? "");
  player.streak = gap === 86_400_000 ? player.streak + 1 : 1;
  player.lastPracticeDate = today;
}
