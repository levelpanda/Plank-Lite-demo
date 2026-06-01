import { create } from 'zustand';
import { TrainingRecord, UserSettings, TrainingConfig, ChallengeDayConfig, PausedChallengeState } from './types';

interface AppState {
  trainingRecords: TrainingRecord[];
  userSettings: UserSettings;
  currentConfig: TrainingConfig;
  isTraining: boolean;
  isPaused: boolean;
  remainingTime: number;
  showTutorial: boolean;
  activeTab: 'training' | 'stats';
  pausedChallengeStates: Record<number, PausedChallengeState>;

  loadData: () => void;
  saveData: () => void;
  addTrainingRecord: (record: TrainingRecord) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  updateTrainingConfig: (config: Partial<TrainingConfig>) => void;
  startTraining: (duration?: number) => void;
  pauseTraining: () => void;
  resumeTraining: () => void;
  endTraining: (duration: number) => void;
  toggleTutorial: () => void;
  setActiveTab: (tab: 'training' | 'stats') => void;
  resetData: () => void;
  setChallengeDay: (day: number) => void;
  savePausedChallenge: (state: PausedChallengeState) => void;
  clearPausedChallenge: (day: number) => void;
}

const defaultSettings: UserSettings = {
  reminderEnabled: false,
  reminderTime: '09:00',
  voiceEnabled: true,
  streak: 0,
  bestDuration: 0,
  totalDuration: 0,
  totalSessions: 0,
  challengeDay: 1,
  challengeCompletedToday: false,
};

const defaultConfig: TrainingConfig = {
  duration: 60,
  sets: 2,
  restDuration: 30,
};

const defaultRecords: TrainingRecord[] = [];

const defaultPausedStates: Record<number, PausedChallengeState> = {};

export const getChallengeConfig = (day: number): ChallengeDayConfig => {
  // 休息日
  if (day === 7 || day === 21 || day === 28) {
    return { duration: 0, sets: 0, restDuration: 0 };
  }
  
  // 调整休息日之后的天数
  let adjustedDay = day;
  if (day > 7) adjustedDay -= 1;
  if (day > 21) adjustedDay -= 1;
  if (day > 28) adjustedDay -= 1;
  
  if (adjustedDay <= 5) return { duration: 20, sets: 1, restDuration: 30 };
  if (adjustedDay <= 10) return { duration: 30, sets: 2, restDuration: 30 };
  if (adjustedDay <= 15) return { duration: 60, sets: 3, restDuration: 30 };
  if (adjustedDay <= 20) return { duration: 60, sets: 3, restDuration: 10 };
  if (adjustedDay <= 25) return { duration: 90, sets: 4, restDuration: 30 };
  return { duration: 90, sets: 4, restDuration: 15 };
};

export const useAppStore = create<AppState>((set, get) => ({
  trainingRecords: [],
  userSettings: defaultSettings,
  currentConfig: defaultConfig,
  isTraining: false,
  isPaused: false,
  remainingTime: 0,
  showTutorial: false,
  activeTab: 'training',
  pausedChallengeStates: defaultPausedStates,

  loadData: () => {
    const savedRecords = localStorage.getItem('trainingRecords');
    const savedSettings = localStorage.getItem('userSettings');
    const savedConfig = localStorage.getItem('trainingConfig');
    const savedPausedStates = localStorage.getItem('pausedChallengeStates');

    set({
      trainingRecords: savedRecords ? JSON.parse(savedRecords) : defaultRecords,
      userSettings: savedSettings ? JSON.parse(savedSettings) : defaultSettings,
      currentConfig: savedConfig ? JSON.parse(savedConfig) : defaultConfig,
      pausedChallengeStates: savedPausedStates ? JSON.parse(savedPausedStates) : defaultPausedStates,
    });
  },

  saveData: () => {
    const { trainingRecords, userSettings, currentConfig, pausedChallengeStates } = get();
    localStorage.setItem('trainingRecords', JSON.stringify(trainingRecords));
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    localStorage.setItem('trainingConfig', JSON.stringify(currentConfig));
    localStorage.setItem('pausedChallengeStates', JSON.stringify(pausedChallengeStates));
  },

  addTrainingRecord: (record) => {
    set((state) => {
      const newRecords = [...state.trainingRecords, record];
      const newSettings = { ...state.userSettings };

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const lastRecordDate = state.trainingRecords.length > 0
        ? new Date(state.trainingRecords[state.trainingRecords.length - 1].date).toDateString()
        : null;

      if (lastRecordDate === yesterday) {
        newSettings.streak += 1;
      } else if (lastRecordDate !== today) {
        newSettings.streak = 1;
      }

      newSettings.totalDuration += record.duration;
      newSettings.totalSessions += 1;

      if (record.duration > newSettings.bestDuration) {
        newSettings.bestDuration = record.duration;
      }

      return {
        trainingRecords: newRecords,
        userSettings: newSettings,
      };
    });
    get().saveData();
  },

  updateUserSettings: (settings) => {
    set((state) => ({
      userSettings: { ...state.userSettings, ...settings },
    }));
    get().saveData();
  },

  updateTrainingConfig: (config) => {
    set((state) => ({
      currentConfig: { ...state.currentConfig, ...config },
    }));
    get().saveData();
  },

  startTraining: (duration) => {
    const config = get().currentConfig;
    set({
      isTraining: true,
      isPaused: false,
      remainingTime: duration || config.duration,
    });
  },

  pauseTraining: () => {
    set({ isPaused: true });
  },

  resumeTraining: () => {
    set({ isPaused: false });
  },

  endTraining: (duration) => {
    set({
      isTraining: false,
      isPaused: false,
      remainingTime: 0,
    });
  },

  toggleTutorial: () => {
    set((state) => ({ showTutorial: !state.showTutorial }));
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setChallengeDay: (day) => {
    set((state) => ({
      userSettings: {
        ...state.userSettings,
        challengeDay: day,
        challengeCompletedToday: false,
      },
    }));
    get().saveData();
  },

  savePausedChallenge: (state) => {
    set((prev) => ({
      pausedChallengeStates: {
        ...prev.pausedChallengeStates,
        [state.day]: state,
      },
    }));
    get().saveData();
  },

  clearPausedChallenge: (day) => {
    set((prev) => {
      const newStates = { ...prev.pausedChallengeStates };
      delete newStates[day];
      return {
        pausedChallengeStates: newStates,
      };
    });
    get().saveData();
  },

  resetData: () => {
    localStorage.removeItem('trainingRecords');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('trainingConfig');
    localStorage.removeItem('pausedChallengeStates');
    
    set({
      trainingRecords: defaultRecords,
      userSettings: defaultSettings,
      currentConfig: defaultConfig,
      isTraining: false,
      isPaused: false,
      remainingTime: 0,
      showTutorial: false,
      activeTab: 'training',
      pausedChallengeStates: defaultPausedStates,
    });
  },
}));
