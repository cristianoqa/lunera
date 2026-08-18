import { create } from "zustand";
import type { AgeBand, KnownCondition, UserGoal, UserProfile } from "../types/user";
import type { CyclePrediction, CycleRecord } from "../types/cycle";
import type { CalendarMonthGrid, CycleVariability } from "../types/calendar";
import type { DailyLog } from "../types/dailyLog";
import type { AppConfig } from "../types/config";
import type { ClinicalAlert } from "../types/clinical";
import {
  getLogByDate,
  loadConfig,
  loadCycles,
  loadLogs,
  saveConfig,
  saveCycles,
  saveLog,
} from "../services/localStorage";
import { saveProfile } from "../services/localAuthService";
import {
  recalcularFasesDelCiclo,
  seedCyclesFromProfile,
  togglePeriodEnd,
  togglePeriodStart,
  validatePeriodStartDate,
} from "../services/cycleRecalculationService";
import { todayISOLocal } from "../services/cyclePredictor";
import { rescheduleAllNotifications } from "../services/notificationService";
import { isPostpartumMode } from "../services/lifeCycleService";
import { buildClinicalAlerts } from "../services/clinicalRulesService";

interface AppState {
  profile: UserProfile | null;
  prediction: CyclePrediction | null;
  config: AppConfig | null;
  logs: DailyLog[];
  cycles: CycleRecord[];
  calendarMonths: CalendarMonthGrid[];
  variability: CycleVariability | null;
  clinicalAlerts: ClinicalAlert[];
  hydrated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  hydrate: (userId: string) => Promise<void>;
  refreshPrediction: () => void;
  recalculateAll: () => Promise<void>;
  applyPeriodStart: (date: string, active: boolean) => Promise<void>;
  applyPeriodEnd: (date: string, active: boolean) => Promise<void>;
  upsertTodayLog: (partial: Partial<DailyLog>) => Promise<void>;
  setPremium: (active: boolean) => Promise<void>;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  prediction: null,
  config: null,
  logs: [],
  cycles: [],
  calendarMonths: [],
  variability: null,
  clinicalAlerts: [],
  hydrated: false,

  setProfile: (profile) => {
    set({ profile });
    get().refreshPrediction();
  },

  hydrate: async (userId) => {
    const [logs, config, allCycles] = await Promise.all([loadLogs(), loadConfig(userId), loadCycles()]);
    let cycles = allCycles.filter((c) => c.userId === userId);
    const profile = get().profile;

    if (profile && cycles.length === 0 && profile.lastPeriodStart) {
      cycles = seedCyclesFromProfile(profile);
      await saveCycles([...allCycles.filter((c) => c.userId !== userId), ...cycles]);
    }

    set({
      logs: logs.filter((l) => l.userId === userId),
      config,
      cycles,
      clinicalAlerts: buildClinicalAlerts({
        profile,
        config,
        cycles,
        logs: logs.filter((l) => l.userId === userId),
      }),
      hydrated: true,
    });

    if (config?.locale) {
      const { default: i18n } = await import("../i18n");
      await i18n.changeLanguage(config.locale);
    }

    await get().recalculateAll();
  },

  recalculateAll: async () => {
    const { profile, cycles, config } = get();
    if (!profile?.lastPeriodStart) {
      set({ prediction: null, calendarMonths: [], variability: null, clinicalAlerts: [] });
      return;
    }

    try {
      const result = recalcularFasesDelCiclo({ cycles, profile, config });
      const updatedProfile: UserProfile = { ...profile, ...result.profilePatch };
      await saveProfile(updatedProfile);
      await saveCycles(
        (await loadCycles()).filter((c) => c.userId !== profile.id).concat(result.cycles)
      );

      set({
        profile: updatedProfile,
        cycles: result.cycles,
        prediction: result.prediction,
        calendarMonths: result.calendarMonths,
        variability: result.variability,
        clinicalAlerts: buildClinicalAlerts({
          profile: updatedProfile,
          config,
          cycles: result.cycles,
          logs: get().logs,
        }),
      });

      if (config) {
        await rescheduleAllNotifications(config, result.prediction).catch(() => {});
      }
    } catch {
      set({ prediction: null, calendarMonths: [], variability: null, clinicalAlerts: [] });
    }
  },

  refreshPrediction: () => {
    get().recalculateAll().catch(() => {});
  },

  applyPeriodStart: async (date, active) => {
    const { profile, cycles, config } = get();
    if (!profile) return;
    if (active && !validatePeriodStartDate(date).ok) return;
    const currentlyStart = cycles.some((c) => c.startDate === date);
    if (active === currentlyStart) return;
    if (active && isPostpartumMode(config) && config) {
      const updated = {
        ...config,
        appMode: "MENSTRUATION_TRACKING" as const,
        pregnancy: config.pregnancy ? { ...config.pregnancy, babyBornAt: null } : null,
      };
      await saveConfig(updated);
      set({ config: updated });
    }
    const nextCycles = togglePeriodStart(cycles, profile.id, date);
    set({ cycles: nextCycles });
    await get().recalculateAll();
  },

  applyPeriodEnd: async (date, active) => {
    const { profile, cycles } = get();
    if (!profile) return;
    const currentlyEnd = cycles.some((c) => c.endDate === date);
    if (active === currentlyEnd) return;
    const nextCycles = togglePeriodEnd(cycles, date);
    set({ cycles: nextCycles });
    await get().recalculateAll();
  },

  upsertTodayLog: async (partial) => {
    const { profile, prediction } = get();
    if (!profile) return;
    const date = partial.date ?? todayISOLocal();
    const existing = (await getLogByDate(profile.id, date)) ?? {
      id: `log-${date}`,
      userId: profile.id,
      date,
      cycleDay: prediction?.currentCycleDay ?? null,
      phase: prediction?.currentPhase ?? null,
      bleeding: 0 as const,
      pain: 0 as const,
      moods: [],
      symptoms: [],
      extraSymptoms: [],
      cervicalMucus: null,
      sex: null,
      pillTaken: null,
      lifestyle: { sleepHours: null, exerciseMinutes: null, waterGlasses: null, stressLevel: 0 },
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const merged: DailyLog = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    const next = await saveLog(merged);
    const userLogs = next.filter((l) => l.userId === profile.id);
    set({
      logs: userLogs,
      clinicalAlerts: buildClinicalAlerts({
        profile,
        config: get().config,
        cycles: get().cycles,
        logs: userLogs,
      }),
    });
  },

  setPremium: async (active) => {
    const cfg = get().config;
    if (!cfg) return;
    const updated = { ...cfg, premiumActive: active };
    await saveConfig(updated);
    set({ config: updated });
  },

  updateConfig: async (patch) => {
    const cfg = get().config;
    if (!cfg) return;
    const updated = { ...cfg, ...patch };
    await saveConfig(updated);
    set({
      config: updated,
      clinicalAlerts: buildClinicalAlerts({
        profile: get().profile,
        config: updated,
        cycles: get().cycles,
        logs: get().logs,
      }),
    });
    await rescheduleAllNotifications(updated, get().prediction);
  },
}));

export function buildProfileFromOnboarding(input: {
  id: string;
  lastPeriodStart: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  goals: UserGoal[];
  ageBand?: AgeBand | null;
  knownConditions?: KnownCondition[];
}): UserProfile {
  const now = new Date().toISOString();
  return {
    id: input.id,
    authMode: "guest",
    goals: input.goals,
    ageBand: input.ageBand ?? null,
    knownConditions: input.knownConditions ?? [],
    lastPeriodStart: input.lastPeriodStart,
    averageCycleLength: input.averageCycleLength,
    averagePeriodLength: input.averagePeriodLength,
    onboardingCompleted: true,
    createdAt: now,
    updatedAt: now,
  };
}
