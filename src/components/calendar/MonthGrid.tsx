import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { CalendarDayMarker } from "../../types/calendar";
import type { CustomEmojiConfig } from "../../types/config";
import { DEFAULT_EMOJI_CONFIG, resolveDayEmoji } from "../../constants/calendarEmojis";

/** Semana ISO (lunes primero), coherente con buildMonthGrid en cycleRecalculationService */
const WEEKDAY_KEYS = ["cal_wd_mon", "cal_wd_tue", "cal_wd_wed", "cal_wd_thu", "cal_wd_fri", "cal_wd_sat", "cal_wd_sun"] as const;

function chunkIntoWeeks(days: (CalendarDayMarker | null)[]): (CalendarDayMarker | null)[][] {
  const rows: (CalendarDayMarker | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }
  const last = rows[rows.length - 1];
  if (last && last.length < 7) {
    while (last.length < 7) last.push(null);
  }
  return rows;
}

interface Props {
  year: number;
  month: number;
  days: (CalendarDayMarker | null)[];
  onDayPress: (date: string) => void;
  emojis?: CustomEmojiConfig;
}

function renderDayCell(
  cell: CalendarDayMarker | null,
  key: string,
  colors: ReturnType<typeof useAppTheme>,
  emojis: CustomEmojiConfig,
  onDayPress: (date: string) => void
) {
  if (!cell) {
    return <View key={key} style={styles.cellOuter} />;
  }
  const isPeriod = cell.kinds.includes("period_confirmed") || cell.kinds.includes("period_predicted");
  const isPredicted = cell.kinds.includes("period_predicted") && !cell.kinds.includes("period_confirmed");
  const isFertile = cell.kinds.includes("fertile") || cell.kinds.includes("ovulation");
  const isToday = cell.kinds.includes("today");
  const isPillActive = cell.kinds.includes("pill_active");
  const isWithdrawal = cell.kinds.includes("withdrawal") || cell.kinds.includes("pill_rest");
  const dayNum = Number(cell.date.slice(-2));
  const emoji = resolveDayEmoji(cell.kinds, emojis);

  return (
    <Pressable key={key} onPress={() => onDayPress(cell.date)} style={styles.cellOuter}>
      <View
        style={[
          styles.cellInner,
          isPeriod && { backgroundColor: colors.menstrualStart },
          isPredicted && { backgroundColor: colors.menstrualEnd, opacity: 0.55 },
          isFertile && !isPeriod && { backgroundColor: colors.primarySoft },
          isPillActive && !isPeriod && { backgroundColor: colors.bgMist },
          isWithdrawal && !isPeriod && { backgroundColor: colors.menstrualEnd, opacity: 0.4 },
          isToday && { borderWidth: 2, borderColor: colors.primary },
        ]}
      >
        <Text
          style={[styles.dayNum, { color: colors.text }, (isPeriod || isPredicted) && styles.dayOnPeriod]}
        >
          {dayNum}
        </Text>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      </View>
    </Pressable>
  );
}

export default function MonthGrid({ year, month, days, onDayPress, emojis = DEFAULT_EMOJI_CONFIG }: Props) {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const date = new Date(Date.UTC(year, month - 1, 1));
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(date);
  const monthLabel = `${monthName} ${year}`;
  const weekRows = chunkIntoWeeks(days);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.monthTitle, { color: colors.text }]}>{monthLabel}</Text>
      <View style={styles.weekRow}>
        {WEEKDAY_KEYS.map((key) => (
          <Text key={key} style={[styles.weekday, { color: colors.textMuted }]}>
            {t(key)}
          </Text>
        ))}
      </View>
      {weekRows.map((row, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.weekRow}>
          {row.map((cell, colIdx) =>
            renderDayCell(cell, cell?.date ?? `empty-${rowIdx}-${colIdx}`, colors, emojis, onDayPress)
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  monthTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  cellOuter: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
  },
  cellInner: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  dayNum: { fontSize: 13, fontWeight: "600", lineHeight: 16 },
  dayOnPeriod: { color: "#fff", fontWeight: "800" },
  emoji: { fontSize: 11, marginTop: 1 },
});
