import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppConfig } from "../types/config";
import type { DailyLog } from "../types/dailyLog";
import type { CycleRecord } from "../types/cycle";
import { DEFAULT_EMOJI_CONFIG, normalizeEmojiConfig } from "../constants/calendarEmojis";
import { DEFAULT_APP_MODE } from "../types/lifeCycle";
import { resolveDeviceLocale } from "../i18n/locale";

const KEYS = {
  logs: "lunera:logs:v1",
  config: "lunera:config:v1",
  cycles: "lunera:cycles:v1",
};

export const defaultConfig = (userId: string): AppConfig => ({
  userId,
  locale: resolveDeviceLocale(),
  theme: "system",
  appThemeId: "linen",
  appLockEnabled: false,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
  periodReminderDaysBefore: 2,
  premiumActive: false,
  revenueCatCustomerId: null,
  lastBackupAt: null,
  syncEnabled: false,
  cloudSyncedAt: null,
  analyticsOptIn: false,
  calendarEmojis: { ...DEFAULT_EMOJI_CONFIG },
  appMode: DEFAULT_APP_MODE,
  pregnancy: null,
  contraception: null,
  menopause: null,
  updatedAt: new Date().toISOString(),
});

function normalizeDailyLog(log: DailyLog): DailyLog {
  return {
    ...log,
    bleedingDetails: log.bleedingDetails ?? {
      type: log.bleeding > 0 ? "period" : "none",
      flowLevel: log.bleeding,
      hasClots: false,
      padOrTamponCount: null,
      notes: "",
    },
    menopauseSymptoms: log.menopauseSymptoms ?? null,
    fetalMovement: log.fetalMovement ?? null,
    bloodPressure: log.bloodPressure ?? { systolic: null, diastolic: null },
    pregnancyAlertSymptoms: log.pregnancyAlertSymptoms ?? [],
    extraSymptoms: log.extraSymptoms ?? [],
    cervicalMucus: log.cervicalMucus ?? null,
    sex: log.sex ?? null,
    pillTaken: log.pillTaken ?? null,
    lifestyle: {
      sleepHours: log.lifestyle?.sleepHours ?? null,
      exerciseMinutes: log.lifestyle?.exerciseMinutes ?? null,
      waterGlasses: log.lifestyle?.waterGlasses ?? null,
      stressLevel: log.lifestyle?.stressLevel ?? 0,
    },
  };
}

export async function loadLogs(): Promise<DailyLog[]> {
  const raw = await AsyncStorage.getItem(KEYS.logs);
  const list = raw ? JSON.parse(raw) : [];
  return Array.isArray(list) ? list.map((entry) => normalizeDailyLog(entry as DailyLog)) : [];
}

export async function saveLog(log: DailyLog): Promise<DailyLog[]> {
  const list = await loadLogs();
  const next = [log, ...list.filter((l) => l.date !== log.date || l.userId !== log.userId)].slice(0, 400);
  await AsyncStorage.setItem(KEYS.logs, JSON.stringify(next));
  return next;
}

export async function getLogByDate(userId: string, date: string): Promise<DailyLog | null> {
  const list = await loadLogs();
  return list.find((l) => l.userId === userId && l.date === date) ?? null;
}

export async function loadConfig(userId: string): Promise<AppConfig> {
  const raw = await AsyncStorage.getItem(KEYS.config);
  if (!raw) return defaultConfig(userId);
  const cfg = JSON.parse(raw) as AppConfig;
  if (cfg.userId !== userId) return defaultConfig(userId);
  return {
    ...defaultConfig(userId),
    ...cfg,
    calendarEmojis: normalizeEmojiConfig(cfg.calendarEmojis),
    pregnancy: cfg.pregnancy
      ? {
          prenatalVisitNotes: [],
          lastKickCountAt: null,
          ...cfg.pregnancy,
        }
      : null,
    contraception: cfg.contraception
      ? {
          reviewDate: null,
          ...cfg.contraception,
        }
      : null,
    menopause: cfg.menopause
      ? {
          mrsScore: null,
          lastAssessmentAt: null,
          ...cfg.menopause,
        }
      : null,
  };
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await AsyncStorage.setItem(KEYS.config, JSON.stringify({ ...config, updatedAt: new Date().toISOString() }));
}

export async function loadCycles(): Promise<CycleRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.cycles);
  const list = raw ? JSON.parse(raw) : [];
  return Array.isArray(list) ? list : [];
}

export async function saveCycles(cycles: CycleRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.cycles, JSON.stringify(cycles));
}

/** Reasigna logs/ciclos/config de un userId a otro (invitado → cuenta) */
export async function migrateUserData(fromUserId: string, toUserId: string): Promise<void> {
  if (fromUserId === toUserId) return;
  const [logs, cycles, configRaw] = await Promise.all([
    loadLogs(),
    loadCycles(),
    AsyncStorage.getItem(KEYS.config),
  ]);
  const nextLogs = logs.map((l) => (l.userId === fromUserId ? { ...l, userId: toUserId } : l));
  const nextCycles = cycles.map((c) => (c.userId === fromUserId ? { ...c, userId: toUserId } : c));
  await AsyncStorage.setItem(KEYS.logs, JSON.stringify(nextLogs));
  await AsyncStorage.setItem(KEYS.cycles, JSON.stringify(nextCycles));
  if (configRaw) {
    const cfg = JSON.parse(configRaw) as AppConfig;
    if (cfg.userId === fromUserId) {
      await saveConfig({ ...cfg, userId: toUserId });
    }
  }
}

export async function exportAllData() {
  const [logs, cycles, configRaw] = await Promise.all([
    loadLogs(),
    loadCycles(),
    AsyncStorage.getItem(KEYS.config),
  ]);
  const profileRaw = await AsyncStorage.getItem("lunera:profile");
  return {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    profile: profileRaw ? JSON.parse(profileRaw) : null,
    logs,
    cycles,
    config: configRaw ? JSON.parse(configRaw) : null,
  };
}

export async function importAllData(payload: Awaited<ReturnType<typeof exportAllData>>): Promise<void> {
  if (payload.profile) await AsyncStorage.setItem("lunera:profile", JSON.stringify(payload.profile));
  await AsyncStorage.setItem(KEYS.logs, JSON.stringify(payload.logs ?? []));
  await AsyncStorage.setItem(KEYS.cycles, JSON.stringify(payload.cycles ?? []));
  if (payload.config) await AsyncStorage.setItem(KEYS.config, JSON.stringify(payload.config));
}
