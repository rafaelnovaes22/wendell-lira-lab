export type PlayerLevel = "competitivo" | "elite" | "pro";
export type PlayerMood = "tranquilo" | "ansioso" | "frustrado" | "confiante";

export interface TrainingTrack {
  id: string;
  number: string;
  title: string;
  description: string;
  accent: "lime" | "cyan" | "yellow";
}

export interface Lesson {
  id: string;
  trackId: string;
  title: string;
  focus: string;
  durationMinutes: number;
  xp: number;
  videoUrl: string | null;
  thumbnail: string;
  published: boolean;
}

export interface PricingConfig {
  current: number;
  next: number;
  increaseStep: number;
  capacity: number;
  enrolled: number;
  currency: "BRL";
}

export interface TrainingRequest {
  goal: string;
  level: PlayerLevel;
  weeklyHours: number;
  mood: PlayerMood;
}

export interface PlanSession {
  day: string;
  objective: string;
  lessonId: string;
  minutes: number;
}

export interface TrainingPlan {
  id: string;
  createdAt: string;
  headline: string;
  weeklyFocus: string;
  coachNote: string;
  recoveryProtocol: string;
  sessions: PlanSession[];
}

export interface PlayerSignals {
  goal: string;
  level: PlayerLevel;
  weeklyHours: number;
  lastMood: PlayerMood;
  updatedAt: string;
}

export interface PlayerProfile {
  id: string;
  xp: number;
  streak: number;
  division: string;
  completedLessonIds: string[];
  signals: PlayerSignals;
  lastPlan: TrainingPlan | null;
  lastPracticeDate?: string;
  statistics?: PlatformTelemetry;
}

export interface PlatformTelemetry {
  plansGenerated: number;
  checkIns: number;
  completions: number;
}

export interface PlatformState {
  version: 1;
  updatedAt: string;
  tracks: TrainingTrack[];
  lessons: Lesson[];
  pricing: PricingConfig;
  telemetry: PlatformTelemetry;
  players: Record<string, PlayerProfile>;
}

export interface PublicSnapshot {
  updatedAt: string;
  tracks: TrainingTrack[];
  lessons: Lesson[];
  pricing: PricingConfig;
  profile: PlayerProfile;
  metrics: PlatformTelemetry & { activePlayers: number };
  mentorRadar: {
    dominantNeed: string;
    suggestedMentoringFocus: string;
  };
}

export type AdminAction =
  | {
      type: "addLesson";
      lesson: Omit<Lesson, "id" | "thumbnail" | "published">;
    }
  | {
      type: "updatePricing";
      current: number;
      increaseStep: number;
      capacity: number;
    }
  | { type: "advancePrice" };
