export interface TrainingRecord {
  id: string;
  duration: number;
  date: string;
  completed: boolean;
}

export interface UserSettings {
  reminderEnabled: boolean;
  reminderTime: string;
  voiceEnabled: boolean;
  streak: number;
  bestDuration: number;
  totalDuration: number;
  totalSessions: number;
  challengeDay: number;
  challengeCompletedToday: boolean;
}

export interface TrainingConfig {
  duration: number;
  sets: number;
  restDuration: number;
}

export interface ChallengeDayConfig {
  duration: number;
  sets: number;
  restDuration: number;
}

export interface PausedChallengeState {
  day: number;
  currentSet: number;
  remainingTime: number;
  totalDuration: number;
  isResting: boolean;
}
