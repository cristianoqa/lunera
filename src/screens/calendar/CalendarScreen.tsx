import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, PanResponder, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LuneraShadows } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import MonthGrid from "../../components/calendar/MonthGrid";
import DayEditScreen from "./DayEditScreen";
import CycleVariabilityCard from "../../components/calendar/CycleVariabilityCard";
import { isPeriodEnd, isPeriodStart, validatePeriodStartDate } from "../../services/cycleRecalculationService";
import { DEFAULT_EMOJI_CONFIG, normalizeEmojiConfig } from "../../constants/calendarEmojis";
import { shouldPaintPeriodOnCalendar } from "../../services/lifeCycleService";

type CalendarViewMode = "month" | "year";

export default function CalendarScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const monthLayouts = useRef<Record<number, number>>({});
  const calendarMonths = useAppStore((s) => s.calendarMonths);
  const variability = useAppStore((s) => s.variability);
  const cycles = useAppStore((s) => s.cycles);
  const config = useAppStore((s) => s.config);
  const applyPeriodStart = useAppStore((s) => s.applyPeriodStart);
  const applyPeriodEnd = useAppStore((s) => s.applyPeriodEnd);
  const emojis = useMemo(
    () => normalizeEmojiConfig(config?.calendarEmojis ?? DEFAULT_EMOJI_CONFIG),
    [config?.calendarEmojis]
  );
  const paintCycle = shouldPaintPeriodOnCalendar(config);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [scrolledToToday, setScrolledToToday] = useState(false);

  const todayMonthIndex = useMemo(() => {
    const today = new Date();
    return calendarMonths.findIndex((g) => g.year === today.getFullYear() && g.month === today.getMonth() + 1);
  }, [calendarMonths]);

  const singleMonth = useMemo(() => {
    return (
      calendarMonths.find((g) => g.year === monthCursor.year && g.month === monthCursor.month) ??
      calendarMonths[todayMonthIndex] ??
      calendarMonths[0]
    );
  }, [calendarMonths, monthCursor, todayMonthIndex]);

  const shiftMonth = (delta: number) => {
    setMonthCursor((prev) => {
      const d = new Date(Date.UTC(prev.year, prev.month - 1 + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
    });
  };

  const monthSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) > 14 && Math.abs(gesture.dy) < 28,
        onPanResponderRelease: (_evt, gesture) => {
          if (Math.abs(gesture.dx) < 42 || Math.abs(gesture.dy) > 36) return;
          if (gesture.dx < 0) shiftMonth(1);
          else shiftMonth(-1);
        },
      }),
    []
  );

  const onDayPress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const isStart = selectedDate ? isPeriodStart(cycles, selectedDate) : false;
  const isEnd = selectedDate ? isPeriodEnd(cycles, selectedDate) : false;

  const onToggleStart = async (value: boolean) => {
    if (!selectedDate) return;
    if (value && !validatePeriodStartDate(selectedDate).ok) {
      Alert.alert(t("calendar_future_period_title"), t("calendar_future_period_body"));
      return;
    }
    await applyPeriodStart(selectedDate, value);
  };

  const onToggleEnd = async (value: boolean) => {
    if (!selectedDate) return;
    await applyPeriodEnd(selectedDate, value);
  };

  const openCustomize = () => {
    navigation.navigate("SettingsTab", { screen: "CustomizeIcons" });
  };

  if (selectedDate) {
    return (
      <DayEditScreen
        date={selectedDate}
        isStart={isStart}
        isEnd={isEnd}
        cycleEditingEnabled={paintCycle}
        onToggleStart={onToggleStart}
        onToggleEnd={onToggleEnd}
        onClose={() => setSelectedDate(null)}
      />
    );
  }

  if (!calendarMonths.length) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.bgLinen }]}>
        <Text style={{ color: colors.textMuted }}>{t("calendar_empty")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bgLinen }]}>
      <View style={styles.toolbar}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>{t("calendar_title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {paintCycle ? t("calendar_subtitle") : t("calendar_no_cycle_subtitle")}
          </Text>
        </View>
        {paintCycle ? (
        <Pressable onPress={openCustomize} style={[styles.customizeBtn, { backgroundColor: colors.surfaceGlass }]}>
          <Text style={styles.customizeEmojis}>
            {emojis.menstruation}
            {emojis.ovulation}
            {emojis.fertility}
          </Text>
        </Pressable>
        ) : null}
      </View>

      <View style={[styles.viewToggle, { backgroundColor: colors.bgMist }]}>
        <Pressable
          onPress={() => setViewMode("month")}
          style={[styles.toggleBtn, viewMode === "month" && { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.toggleText, { color: viewMode === "month" ? "#fff" : colors.text }]}>
            {t("calendar_view_month")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode("year")}
          style={[styles.toggleBtn, viewMode === "year" && { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.toggleText, { color: viewMode === "year" ? "#fff" : colors.text }]}>
            {t("calendar_view_year")}
          </Text>
        </Pressable>
      </View>

      {paintCycle ? (
      <View style={styles.legendCard}>
        <LegendItem emoji={emojis.menstruation} label={t("calendar_legend_period")} color="rgba(217,70,122,0.2)" text={colors.text} />
        <LegendItem emoji={emojis.ovulation} label={t("calendar_legend_ovulation")} color="rgba(232,121,169,0.2)" text={colors.text} />
        <LegendItem emoji={emojis.fertility} label={t("calendar_legend_fertile")} color="rgba(165,145,184,0.22)" text={colors.text} />
      </View>
      ) : null}

      {viewMode === "month" ? (
        <View style={styles.monthPane}>
          <View style={styles.monthNav}>
            <Pressable onPress={() => shiftMonth(-1)} hitSlop={12} style={styles.navBtn}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => {
                const d = new Date();
                setMonthCursor({ year: d.getFullYear(), month: d.getMonth() + 1 });
              }}
            >
              <Text style={[styles.monthNavLabel, { color: colors.text }]}>{t("calendar_today")}</Text>
            </Pressable>
            <Pressable onPress={() => shiftMonth(1)} hitSlop={12} style={styles.navBtn}>
              <MaterialCommunityIcons name="chevron-right" size={28} color={colors.primary} />
            </Pressable>
          </View>
          {singleMonth ? (
            <View
              style={[styles.monthCard, { backgroundColor: colors.surfaceGlass }]}
              {...monthSwipeResponder.panHandlers}
            >
              <MonthGrid
                year={singleMonth.year}
                month={singleMonth.month}
                days={singleMonth.days}
                onDayPress={onDayPress}
                emojis={emojis}
              />
            </View>
          ) : null}
          {variability && paintCycle ? <CycleVariabilityCard variability={variability} /> : null}
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (scrolledToToday || todayMonthIndex < 0) return;
            const y = monthLayouts.current[todayMonthIndex];
            if (typeof y === "number" && scrollRef.current) {
              scrollRef.current.scrollTo({ y: Math.max(0, y - 24), animated: false });
              setScrolledToToday(true);
            }
          }}
        >
          {calendarMonths.map((grid, index) => (
            <View
              key={`${grid.year}-${grid.month}`}
              style={[styles.monthCard, { backgroundColor: colors.surfaceGlass }]}
              onLayout={(e) => {
                monthLayouts.current[index] = e.nativeEvent.layout.y;
              }}
            >
              <MonthGrid
                year={grid.year}
                month={grid.month}
                days={grid.days}
                onDayPress={onDayPress}
                emojis={emojis}
              />
            </View>
          ))}
          {variability && paintCycle ? <CycleVariabilityCard variability={variability} /> : null}
        </ScrollView>
      )}
    </View>
  );
}

function LegendItem({
  emoji,
  label,
  color,
  text,
}: {
  emoji: string;
  label: string;
  color: string;
  text: string;
}) {
  return (
    <View style={[styles.legendItem, { backgroundColor: color }]}>
      <Text style={styles.legendEmoji}>{emoji}</Text>
      <Text style={[styles.legendLabel, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { marginTop: 4, lineHeight: 18, fontSize: 13 },
  customizeBtn: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(165,145,175,0.2)",
  },
  customizeEmojis: { fontSize: 16, letterSpacing: 2 },
  viewToggle: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  toggleBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  toggleText: { fontWeight: "800", fontSize: 13 },
  legendCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  legendEmoji: { fontSize: 13 },
  legendLabel: { fontSize: 12, fontWeight: "600" },
  monthPane: { flex: 1, paddingHorizontal: 16, paddingBottom: 120 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  navBtn: { padding: 4 },
  monthNavLabel: { fontWeight: "700", fontSize: 14 },
  scroll: { paddingHorizontal: 16, paddingBottom: 130 },
  monthCard: {
    borderRadius: 24,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(165,145,175,0.14)",
    ...LuneraShadows.card,
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
