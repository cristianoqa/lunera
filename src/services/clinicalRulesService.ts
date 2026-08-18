import type { AppConfig } from "../types/config";
import type { CycleRecord } from "../types/cycle";
import type { DailyLog } from "../types/dailyLog";
import type { ClinicalAlert } from "../types/clinical";
import type { UserProfile } from "../types/user";
import { diffDays, todayISOLocal } from "./cyclePredictor";
import { pregnancyWeek } from "./pregnancyService";
import { resolveAppMode } from "./lifeCycleService";

function lastCycleLengths(cycles: CycleRecord[]): number[] {
  return [...cycles]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((cycle) => cycle.cycleLength)
    .filter((value): value is number => typeof value === "number");
}

function sameUserLogs(logs: DailyLog[], userId: string): DailyLog[] {
  return logs.filter((log) => log.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
}

function heavyBleedingDays(logs: DailyLog[]): DailyLog[] {
  return logs.filter((log) => {
    const pads = log.bleedingDetails?.padOrTamponCount ?? 0;
    return log.bleeding >= 4 || log.bleedingDetails?.hasClots || pads >= 6;
  });
}

function repeatedSpottingDates(logs: DailyLog[]): string[] {
  return logs
    .filter(
      (log) =>
        log.bleedingDetails?.type === "spotting" ||
        (log.symptoms ?? []).includes("spotting") ||
        log.bleeding === 1
    )
    .slice(0, 6)
    .map((log) => log.date);
}

function uniqueAlerts(alerts: ClinicalAlert[]): ClinicalAlert[] {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    if (seen.has(alert.code)) return false;
    seen.add(alert.code);
    return true;
  });
}

export function summarizeMenopauseBurden(log: DailyLog | null | undefined): number {
  if (!log?.menopauseSymptoms) return 0;
  const values = Object.values(log.menopauseSymptoms);
  return values.reduce((sum, value) => sum + value, 0);
}

export function buildClinicalAlerts(input: {
  profile: UserProfile | null;
  config: AppConfig | null;
  cycles: CycleRecord[];
  logs: DailyLog[];
  today?: string;
}): ClinicalAlert[] {
  const { profile, config, cycles } = input;
  if (!profile) return [];

  const today = input.today ?? todayISOLocal();
  const logs = sameUserLogs(input.logs, profile.id);
  const mode = resolveAppMode(config);
  const cycleLengths = lastCycleLengths(cycles).slice(-6);
  const alerts: ClinicalAlert[] = [];

  if (mode === "MENSTRUATION_TRACKING") {
    if (cycleLengths.filter((value) => value >= 35).length >= 2) {
      alerts.push({
        code: "long_cycle_pattern",
        severity: "warning",
        titleKey: "alert_long_cycle_title",
        bodyKey: "alert_long_cycle_body",
        metadata: { maxDays: Math.max(...cycleLengths) },
      });
    }

    if (cycleLengths.filter((value) => value <= 21).length >= 2) {
      alerts.push({
        code: "short_cycle_pattern",
        severity: "warning",
        titleKey: "alert_short_cycle_title",
        bodyKey: "alert_short_cycle_body",
        metadata: { minDays: Math.min(...cycleLengths) },
      });
    }

    if (cycleLengths.length >= 3) {
      const spread = Math.max(...cycleLengths) - Math.min(...cycleLengths);
      if (spread >= 8) {
        alerts.push({
          code: "cycle_variability_high",
          severity: "info",
          titleKey: "alert_variability_title",
          bodyKey: "alert_variability_body",
          metadata: { spread },
        });
      }
    }

    if (profile.lastPeriodStart && diffDays(profile.lastPeriodStart, today) >= 45) {
      alerts.push({
        code: "amenorrhea_possible",
        severity: "urgent",
        titleKey: "alert_amenorrhea_title",
        bodyKey: "alert_amenorrhea_body",
        relatedDates: [profile.lastPeriodStart],
      });
    }

    const spottingDates = repeatedSpottingDates(logs);
    if (spottingDates.length >= 3) {
      alerts.push({
        code: "repeated_spotting",
        severity: "warning",
        titleKey: "alert_spotting_title",
        bodyKey: "alert_spotting_body",
        relatedDates: spottingDates.slice(0, 3),
      });
    }
  }

  const heavyDays = heavyBleedingDays(logs);
  if (heavyDays.length >= 2) {
    alerts.push({
      code: "heavy_bleeding_pattern",
      severity: "urgent",
      titleKey: "alert_heavy_bleeding_title",
      bodyKey: "alert_heavy_bleeding_body",
      relatedDates: heavyDays.slice(0, 3).map((log) => log.date),
    });
  }

  const latestLog = logs[0] ?? null;
  if (mode === "PREGNANCY_CARE" && config?.pregnancy?.lastMenstrualPeriod) {
    const currentWeek = pregnancyWeek(config.pregnancy.lastMenstrualPeriod, today);
    const pregnancySymptoms = latestLog?.pregnancyAlertSymptoms ?? [];
    if (pregnancySymptoms.length > 0) {
      alerts.push({
        code: "pregnancy_warning_signs",
        severity: "urgent",
        titleKey: "alert_pregnancy_title",
        bodyKey: "alert_pregnancy_body",
        metadata: { week: currentWeek },
      });
    }
    if (latestLog?.fetalMovement?.concern || (latestLog?.fetalMovement && latestLog.fetalMovement.movementCount < 10 && currentWeek >= 28)) {
      alerts.push({
        code: "reduced_fetal_movement",
        severity: "urgent",
        titleKey: "alert_fetal_movement_title",
        bodyKey: "alert_fetal_movement_body",
        metadata: {
          week: currentWeek,
          movementCount: latestLog?.fetalMovement?.movementCount ?? 0,
        },
      });
    }
    if ((latestLog?.bloodPressure?.systolic ?? 0) >= 140 || (latestLog?.bloodPressure?.diastolic ?? 0) >= 90) {
      alerts.push({
        code: "elevated_blood_pressure",
        severity: "urgent",
        titleKey: "alert_bp_title",
        bodyKey: "alert_bp_body",
      });
    }
  }

  if (mode === "MENOPAUSE_SUPPORT" && summarizeMenopauseBurden(latestLog) >= 16) {
    alerts.push({
      code: "menopause_burden_high",
      severity: "warning",
      titleKey: "alert_menopause_title",
      bodyKey: "alert_menopause_body",
      metadata: { score: summarizeMenopauseBurden(latestLog) },
    });
  }

  return uniqueAlerts(alerts);
}
