import type {
  Lesson,
  PlatformState,
  PlayerProfile,
  TrainingTrack,
} from "./pro-lab-types";

const tracks: TrainingTrack[] = [
  {
    id: "game-reading",
    number: "01",
    title: "Leitura do real no virtual",
    description:
      "Triangulação, tabela e pivô do campo aplicados no EA FC e no eFootball. Decisão antes do comando.",
    accent: "yellow",
  },
  {
    id: "defense",
    number: "02",
    title: "Defesa sem se desmontar",
    description:
      "Controle de espaço, troca de cursor e paciência para defender objetivo como o Lira.",
    accent: "cyan",
  },
  {
    id: "attack",
    number: "03",
    title: "Ataque Lirismo",
    description:
      "Objetivo e sem enrolar: superioridade, timing e finalização para transformar domínio em gol.",
    accent: "yellow",
  },
  {
    id: "mindset",
    number: "04",
    title: "Mentalidade Puskás",
    description:
      "Reset emocional, foco e clareza sob pressão, da noite de chuva no Serra Dourada ao FUT Champions.",
    accent: "yellow",
  },
  {
    id: "pro-routine",
    number: "05",
    title: "Rotina PRO 10h",
    description:
      "Treino deliberado diário, review objetivo e repetição. Bom fica quem repete melhor.",
    accent: "cyan",
  },
  {
    id: "efootball",
    number: "06",
    title: "Maestria eFootball",
    description:
      "A aposta atual do Lira: cabeceio, condução, câmera e formações como a 4-3-2-1 no meta do eFootball.",
    accent: "cyan",
  },
];

const lessons: Lesson[] = [
  {
    id: "scan-before-pass",
    trackId: "game-reading",
    title: "Escaneie antes do passe",
    focus: "leitura real no virtual",
    durationMinutes: 14,
    xp: 180,
    videoUrl: null,
    thumbnail: "/tactical-desk.png",
    published: false,
  },
  {
    id: "cursor-discipline",
    trackId: "defense",
    title: "Disciplina na troca de cursor",
    focus: "defesa objetiva",
    durationMinutes: 18,
    xp: 220,
    videoUrl: null,
    thumbnail: "/hero-pro-lab.png",
    published: false,
  },
  {
    id: "protect-the-center",
    trackId: "defense",
    title: "Proteja o centro primeiro",
    focus: "compactação",
    durationMinutes: 16,
    xp: 200,
    videoUrl: null,
    thumbnail: "/championship-trophy.png",
    published: false,
  },
  {
    id: "third-man-run",
    trackId: "attack",
    title: "O terceiro homem decide",
    focus: "criação e tabela",
    durationMinutes: 20,
    xp: 240,
    videoUrl: null,
    thumbnail: "/tactical-desk.png",
    published: false,
  },
  {
    id: "reset-after-goal",
    trackId: "mindset",
    title: "Reset de 40 segundos",
    focus: "controle emocional",
    durationMinutes: 9,
    xp: 160,
    videoUrl: null,
    thumbnail: "/championship-trophy.png",
    published: false,
  },
  {
    id: "review-with-evidence",
    trackId: "pro-routine",
    title: "Review sem desculpas",
    focus: "evolução diária",
    durationMinutes: 22,
    xp: 260,
    videoUrl: null,
    thumbnail: "/hero-pro-lab.png",
    published: false,
  },
  {
    id: "header-secret-efootball",
    trackId: "efootball",
    title: "O segredo do cabeceio no eFootball",
    focus: "cabeceio e posicionamento",
    durationMinutes: 15,
    xp: 230,
    videoUrl: null,
    thumbnail: "/championship-trophy.png",
    published: false,
  },
  {
    id: "conduction-camera-efootball",
    trackId: "efootball",
    title: "Condução e câmera no meta",
    focus: "condução, câmera e 4-3-2-1",
    durationMinutes: 17,
    xp: 240,
    videoUrl: null,
    thumbnail: "/tactical-desk.png",
    published: false,
  },
];

export function createPlayerProfile(id: string): PlayerProfile {
  return {
    id,
    xp: 0,
    streak: 0,
    division: "Classificatória",
    completedLessonIds: [],
    signals: {
      goal: "diagnóstico inicial",
      level: "competitivo",
      weeklyHours: 5,
      lastMood: "tranquilo",
      updatedAt: new Date().toISOString(),
    },
    lastPlan: null,
    statistics: { plansGenerated: 0, checkIns: 0, completions: 0 },
  };
}

export function createSeedPlatform(): PlatformState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    tracks: structuredClone(tracks),
    lessons: structuredClone(lessons),
    pricing: {
      current: 1497,
      next: 1997,
      increaseStep: 500,
      capacity: 8,
      enrolled: 0,
      currency: "BRL",
    },
    telemetry: { plansGenerated: 0, checkIns: 0, completions: 0 },
    players: {},
  };
}
