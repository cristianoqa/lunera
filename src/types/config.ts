/** Preferencias de app, seguridad y monetización */

import type { AppMode, ContraceptionConfig, MenopauseConfig, PregnancyConfig } from "./lifeCycle";

export type ThemePreference = "system" | "light" | "dark";
export type LocaleCode = "es" | "en" | "pt";
export type AppThemeId = "linen" | "lavender" | "rose" | "sage" | "midnight" | "peach";

export interface CustomEmojiConfig {
  menstruation: string;
  ovulation: string;
  fertility: string;
}

export interface AppConfig {
  userId: string;
  locale: LocaleCode;
  theme: ThemePreference;
  /** Pack visual Wellness (5+ opciones) */
  appThemeId: AppThemeId;
  /** Bloqueo biométrico / PIN al abrir */
  appLockEnabled: boolean;
  dailyReminderEnabled: boolean;
  /** HH:mm local */
  dailyReminderTime: string;
  periodReminderDaysBefore: number;
  premiumActive: boolean;
  /** RevenueCat entitlement id */
  revenueCatCustomerId: string | null;
  lastBackupAt: string | null;
  syncEnabled: boolean;
  /** Marca de última subida a nube (vault cifrado) */
  cloudSyncedAt: string | null;
  analyticsOptIn: boolean;
  /** Personalización visual del calendario */
  calendarEmojis: CustomEmojiConfig;
  /** Modo de ciclo de vida (excluyente) */
  appMode: AppMode;
  pregnancy: PregnancyConfig | null;
  contraception: ContraceptionConfig | null;
  menopause: MenopauseConfig | null;
  updatedAt: string;
}

export interface AppConfigRow {
  user_id: string;
  config_json: string;
  updated_at: string;
}

export interface BackupEnvelope {
  version: 1;
  exportedAt: string;
  /** AES-GCM ciphertext of { profile, cycles, logs, config } */
  ciphertext: string;
  iv: string;
  salt: string;
}
