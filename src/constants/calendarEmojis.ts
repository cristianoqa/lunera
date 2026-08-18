/**
 * Sets de emojis personalizables para fases del ciclo en el calendario.
 */

import type { CustomEmojiConfig } from "../types/config";

export type { CustomEmojiConfig };

export const DEFAULT_EMOJI_CONFIG: CustomEmojiConfig = {
  menstruation: "🩸",
  ovulation: "🌸",
  fertility: "✨",
};

export type EmojiCategory = keyof CustomEmojiConfig;

/** Paletas amplias — la usuaria elige libremente */
export const EMOJI_OPTIONS: Record<EmojiCategory, string[]> = {
  menstruation: [
    "🩸", "🔴", "❤️", "🩷", "🍓", "🌹", "🥀", "🍒", "🍎", "🌺",
    "💫", "⚡", "🌙", "💢", "🔺", "⭕", "🟥", "❣️", "💝", "🎆",
  ],
  ovulation: [
    "🌸", "🌱", "⭐", "🥑", "👑", "🌼", "🌻", "🌷", "💐", "🦋",
    "✨", "🌟", "☀️", "🍀", "🌿", "🍃", "🪴", "🌾", "🐝", "🌈",
  ],
  fertility: [
    "✨", "💧", "🔮", "☁️", "🎈", "💎", "🩵", "💙", "🌊", "🫧",
    "❄️", "🪽", "🕊️", "🌕", "🪐", "🎐", "💠", "🔷", "🟣", "🤍",
  ],
};

export function normalizeEmojiConfig(partial?: Partial<CustomEmojiConfig> | null): CustomEmojiConfig {
  return {
    menstruation: partial?.menstruation || DEFAULT_EMOJI_CONFIG.menstruation,
    ovulation: partial?.ovulation || DEFAULT_EMOJI_CONFIG.ovulation,
    fertility: partial?.fertility || DEFAULT_EMOJI_CONFIG.fertility,
  };
}

/** Prioridad: ovulación > menstruación > fértil */
export function resolveDayEmoji(kinds: string[], config: CustomEmojiConfig): string | null {
  if (kinds.includes("ovulation")) return config.ovulation;
  if (kinds.includes("period_confirmed") || kinds.includes("period_predicted")) {
    return config.menstruation;
  }
  if (kinds.includes("withdrawal")) return config.menstruation;
  if (kinds.includes("fertile")) return config.fertility;
  if (kinds.includes("pill_active") || kinds.includes("pill_rest")) return "💊";
  return null;
}
