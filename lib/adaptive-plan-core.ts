import { InputError } from "./input-error";
import type {
  Lesson,
  PlatformState,
  PlayerProfile,
  TrainingPlan,
  TrainingRequest,
} from "./pro-lab-types";

const CRISIS_MARKERS = [
  /me matar/i,
  /suic[ií]d/i,
  /tirar minha vida/i,
  /n[aã]o quero viver/i,
  /me machucar/i,
];

const COACH_CHANNEL_URL = "https://kick.com/wendelllira";

export function hasCrisisLanguage(message: string): boolean {
  return CRISIS_MARKERS.some((marker) => marker.test(message));
}

export function crisisResponse(): string {
  return "Sinto muito que você esteja passando por isso. Este chat não substitui ajuda profissional. Ligue agora para o CVV no 188. Se houver risco imediato, chame o SAMU no 192 ou procure uma emergência. Fique perto de alguém de confiança enquanto busca ajuda.";
}

export async function createAdaptivePlan(
  state: PlatformState,
  player: PlayerProfile,
  request: TrainingRequest,
): Promise<TrainingPlan> {
  const lessons = selectLessons(state.lessons, request);
  if (!lessons.length)
    throw new InputError(
      "O coach ainda não publicou aulas. O plano estará disponível quando houver conteúdo.",
    );
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    headline: headlineFor(request),
    weeklyFocus: lessons.map((lesson) => lesson.focus).join(" + "),
    coachNote: fallbackCoachNote(request),
    recoveryProtocol: recoveryFor(request.mood),
    sessions: buildSessions(lessons, request.weeklyHours),
  };
}

export async function answerCoachChat(
  message: string,
  state: PlatformState,
  player: PlayerProfile,
): Promise<string> {
  if (hasCrisisLanguage(message)) return crisisResponse();
  const lesson = selectChatLesson(message, state.lessons);
  if (!lesson)
    return "Ainda não há aulas publicadas para recomendar. Registre uma decisão que deseja melhorar e retome o plano quando o coach disponibilizar o conteúdo.";
  return `Vamos simplificar: trabalhe ${lesson.focus} hoje. Reveja “${lesson.title}” no canal do coach (${COACH_CHANNEL_URL}), jogue duas partidas com um único objetivo e registre a decisão que mais se repetiu. Resultado vem de clareza, não de volume. Como está o seu ${player.signals.lastMood} antes de jogar?`;
}

function selectLessons(lessons: Lesson[], request: TrainingRequest): Lesson[] {
  const keywords = `${request.goal} ${request.mood}`.toLowerCase();
  return lessons
    .filter((lesson) => lesson.published && Boolean(lesson.videoUrl))
    .map((lesson) => ({ lesson, score: lessonScore(lesson, keywords) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((entry) => entry.lesson);
}

function lessonScore(lesson: Lesson, keywords: string): number {
  let score = lesson.published ? 2 : 0;
  if (/defes|marcar|gol/.test(keywords) && lesson.trackId === "defense")
    score += 8;
  if (/ataque|final|cria/.test(keywords) && lesson.trackId === "attack")
    score += 8;
  if (/ansios|frustr|press/.test(keywords) && lesson.trackId === "mindset")
    score += 9;
  if (/pro|compet|rotina/.test(keywords) && lesson.trackId === "pro-routine")
    score += 7;
  if (/leitura|decis/.test(keywords) && lesson.trackId === "game-reading")
    score += 8;
  return score;
}

function buildSessions(
  lessons: Lesson[],
  weeklyHours: number,
): TrainingPlan["sessions"] {
  const days = ["TER", "QUI", "SÁB"];
  const totalMinutes = Math.round(weeklyHours * 60);
  const sessionBudget = Math.floor(totalMinutes / lessons.length);
  return lessons.map((lesson, index) => ({
    day: days[index] ?? `D${index + 1}`,
    objective: lesson.title,
    lessonId: lesson.id,
    minutes: sessionBudget + (index < totalMinutes % lessons.length ? 1 : 0),
  }));
}

function headlineFor(request: TrainingRequest): string {
  if (request.mood === "ansioso") return "Menos pressa. Mais leitura.";
  if (request.mood === "frustrado") return "Recupere controle antes do placar.";
  if (request.level === "pro") return "Detalhe pequeno. Impacto de campeonato.";
  return "Decida melhor durante sete dias.";
}

function recoveryFor(mood: TrainingRequest["mood"]): string {
  if (mood === "ansioso") {
    return "Após cada partida: 4 respirações lentas, 1 decisão revisada, 2 minutos fora da fila.";
  }
  if (mood === "frustrado") {
    return "Limite de duas derrotas seguidas. Depois, pausa de 12 minutos e revisão sem replay completo.";
  }
  return "Entre partidas: anote uma decisão boa e uma decisão a simplificar.";
}

function fallbackCoachNote(request: TrainingRequest): string {
  return `Seu foco não é jogar mais, é repetir melhor. Com ${request.weeklyHours} horas por semana, cada sessão terá um objetivo observável e uma revisão curta. Sem piloto automático.`;
}

function selectChatLesson(
  message: string,
  lessons: Lesson[],
): Lesson | undefined {
  return selectLessons(lessons, {
    goal: message,
    level: "competitivo",
    weeklyHours: 5,
    mood: /ansios|nervos|press/.test(message.toLowerCase())
      ? "ansioso"
      : "tranquilo",
  })[0];
}
