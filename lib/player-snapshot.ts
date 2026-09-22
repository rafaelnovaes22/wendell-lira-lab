import { createPlayerProfile } from "./seed-platform";
import { visibleStreak } from "./practice-streak";
import type {
  PlatformState,
  PlayerProfile,
  PublicSnapshot,
} from "./pro-lab-types";

export function divisionForXp(xp: number): string {
  if (xp >= 3600) return "Pro League";
  if (xp >= 2200) return "Elite I";
  if (xp >= 1200) return "Elite II";
  if (xp >= 500) return "Competitiva I";
  return "Classificatória";
}

export function createPublicSnapshot(
  state: PlatformState,
  playerId: string,
): PublicSnapshot {
  const player = state.players[playerId] ?? createPlayerProfile(playerId);
  return {
    updatedAt: state.updatedAt,
    tracks: state.tracks,
    lessons: state.lessons,
    pricing: state.pricing,
    profile: { ...player, streak: visibleStreak(player, new Date()) },
    metrics: {
      plansGenerated: player.statistics?.plansGenerated ?? 0,
      checkIns: player.statistics?.checkIns ?? 0,
      completions: player.completedLessonIds.length,
      activePlayers: 1,
    },
    mentorRadar: mentorRadarForMood(player.signals.lastMood),
  };
}

export function mentorRadarForMood(
  mood: PlayerProfile["signals"]["lastMood"],
): PublicSnapshot["mentorRadar"] {
  if (mood === "ansioso" || mood === "frustrado") {
    return {
      dominantNeed: "Controle emocional sob pressão",
      suggestedMentoringFocus:
        "Revisar decisões após sofrer gol e praticar o protocolo de reset.",
    };
  }
  return {
    dominantNeed: "Leitura e consistência",
    suggestedMentoringFocus:
      "Validar o diagnóstico e escolher uma decisão-chave para a próxima sessão.",
  };
}
