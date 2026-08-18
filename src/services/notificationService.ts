import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { AppConfig } from "../types/config";
import type { CyclePrediction } from "../types/cycle";
import { addDays, todayISOLocal } from "./cyclePredictor";
import { shouldPredictPeriods } from "./lifeCycleService";

export const NOTIFICATION_IDS = {
  daily: "lunera-daily-reminder",
  period24h: "lunera-period-24h",
  pill: "lunera-contraception-pill",
  patch: "lunera-contraception-patch",
  ring: "lunera-contraception-ring",
  injection: "lunera-contraception-injection",
  iud: "lunera-contraception-iud",
} as const;

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      // shouldShowAlert + shouldShowBanner a la vez duplica el aviso en Android/Expo SDK 51+.
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function cancelAllOwned(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
  } catch {
    await Promise.all(
      Object.values(NOTIFICATION_IDS).map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)
      )
    );
  }
}

function parseHm(time: string): { hour: number; minute: number } {
  const [hh, mm] = (time || "20:00").split(":").map(Number);
  return { hour: hh || 20, minute: mm || 0 };
}

export async function scheduleDailyReminder(config: AppConfig): Promise<void> {
  if (!config.dailyReminderEnabled) return;
  const { hour, minute } = parseHm(config.dailyReminderTime);
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.daily,
    content: {
      title: "Lunera",
      body: "¿Cómo te sientes hoy? Registra tu día en un minuto.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Alerta local exactamente 24 h antes del inicio estimado del próximo periodo (9:00 local). */
export async function schedulePeriodReminder24h(
  predictedNextPeriodStart: string,
  today?: string
): Promise<void> {
  const ref = today ?? todayISOLocal();
  const reminderDate = addDays(predictedNextPeriodStart, -1);
  if (reminderDate < ref) return;

  const [year, month, day] = reminderDate.split("-").map(Number);
  const triggerDate = new Date(year, month - 1, day, 9, 0, 0, 0);
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.period24h,
    content: {
      title: "Lunera",
      body: "Tu menstruación podría empezar mañana. Revisa cómo te sientes y actualiza tu calendario.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

async function scheduleContraceptionReminders(config: AppConfig): Promise<void> {
  if (config.appMode !== "CONTRACEPTION_CONTROL" || !config.contraception) return;
  const { method, reminderTime, packStartDate } = config.contraception;
  const { hour, minute } = parseHm(reminderTime || "09:00");

  if (method === "pill_daily" || method === "mini_pill") {
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.pill,
      content: {
        title: "Lunera",
        body:
          method === "mini_pill"
            ? "Hora de tu minipíldora. Intenta tomarla siempre a la misma hora."
            : "Hora de tu píldora Lunera. Mantén la constancia.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return;
  }

  if (method === "patch_weekly") {
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.patch,
      content: {
        title: "Lunera",
        body: "Cambia el parche hoy. Un recordatorio cada 7 días ayuda a no olvidarlo.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: new Date(`${packStartDate}T12:00:00`).getDay() + 1,
        hour,
        minute,
      },
    });
    return;
  }

  if (method === "ring_monthly") {
    const next = addDays(packStartDate, 21);
    const [y, m, d] = next.split("-").map(Number);
    const triggerDate = new Date(y, m - 1, d, hour, minute, 0, 0);
    if (triggerDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.ring,
        content: {
          title: "Lunera",
          body: "Revisa tu anillo vaginal. Si te toca retirarlo o reemplazarlo, sigue las indicaciones de tu profesional.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
    return;
  }

  if (method === "injection_monthly") {
    const next = addDays(packStartDate, 28);
    const [y, m, d] = next.split("-").map(Number);
    const triggerDate = new Date(y, m - 1, d, hour, minute, 0, 0);
    if (triggerDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.injection,
        content: {
          title: "Lunera",
          body: "Fecha aproximada de tu inyección. Confirma la cita con tu profesional de salud.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
    return;
  }

  const review = addDays(packStartDate, 365);
  const [y, m, d] = review.split("-").map(Number);
  const triggerDate = new Date(y, m - 1, d, 10, 0, 0, 0);
  if (triggerDate.getTime() > Date.now()) {
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.iud,
      content: {
        title: "Lunera",
        body: "Revisión ginecológica de DIU/implante. Agenda tu cita anual.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}

/** Reprograma recordatorios tras recalcular ciclo o al arrancar la app. Cancela todo antes para no duplicar. */
export async function rescheduleAllNotifications(
  config: AppConfig,
  prediction: CyclePrediction | null
): Promise<void> {
  if (Platform.OS === "web") return;
  const granted = await ensureNotificationPermission();
  await cancelAllOwned();
  if (!granted) return;

  await scheduleDailyReminder(config);
  if (shouldPredictPeriods(config) && prediction?.predictedNextPeriodStart) {
    await schedulePeriodReminder24h(prediction.predictedNextPeriodStart);
  }
  await scheduleContraceptionReminders(config);
}

/** @deprecated Usar schedulePeriodReminder24h */
export async function schedulePeriodReminder(daysUntil: number, daysBefore: number): Promise<void> {
  void daysUntil;
  void daysBefore;
}
