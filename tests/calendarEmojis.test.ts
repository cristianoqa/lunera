import { describe, expect, it } from "vitest";
import {
  DEFAULT_EMOJI_CONFIG,
  EMOJI_OPTIONS,
  normalizeEmojiConfig,
  resolveDayEmoji,
} from "../src/constants/calendarEmojis";

describe("calendarEmojis", () => {
  it("usa defaults cuando falta config", () => {
    expect(normalizeEmojiConfig(null)).toEqual(DEFAULT_EMOJI_CONFIG);
    expect(normalizeEmojiConfig({})).toEqual(DEFAULT_EMOJI_CONFIG);
  });

  it("conserva personalización parcial", () => {
    const cfg = normalizeEmojiConfig({ menstruation: "🍓" });
    expect(cfg.menstruation).toBe("🍓");
    expect(cfg.ovulation).toBe("🌸");
    expect(cfg.fertility).toBe("✨");
  });

  it("prioridad ovulación > menstruación > fértil", () => {
    const cfg = DEFAULT_EMOJI_CONFIG;
    expect(resolveDayEmoji(["ovulation", "fertile"], cfg)).toBe("🌸");
    expect(resolveDayEmoji(["period_confirmed", "fertile"], cfg)).toBe("🩸");
    expect(resolveDayEmoji(["fertile"], cfg)).toBe("✨");
    expect(resolveDayEmoji(["today"], cfg)).toBeNull();
  });

  it("ofrece muchas opciones por categoría para personalizar", () => {
    expect(EMOJI_OPTIONS.menstruation.length).toBeGreaterThanOrEqual(15);
    expect(EMOJI_OPTIONS.ovulation.length).toBeGreaterThanOrEqual(15);
    expect(EMOJI_OPTIONS.fertility.length).toBeGreaterThanOrEqual(15);
    expect(EMOJI_OPTIONS.menstruation[0]).toBe("🩸");
  });
});
