import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LuneraShadows, LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface Props {
  date: string;
  isStart: boolean;
  isEnd: boolean;
  cycleEditingEnabled?: boolean;
  onToggleStart: (value: boolean) => void;
  onToggleEnd: (value: boolean) => void;
  onClose: () => void;
}

/** Pantalla completa (sin bottom sheet) para editar un día del ciclo */
export default function DayEditScreen({
  date,
  isStart,
  isEnd,
  cycleEditingEnabled = true,
  onToggleStart,
  onToggleEnd,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.bgLinen },
        topBar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingBottom: 8,
        },
        back: { color: colors.primary, fontWeight: "700", fontSize: 16, width: 64 },
        topTitle: { fontWeight: "800", color: colors.text, fontSize: 16 },
        scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
        card: {
          backgroundColor: colors.surfaceGlass,
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(165,145,175,0.18)",
          ...LuneraShadows.card,
        },
        dateTitle: {
          fontFamily: LuneraTypography.serif,
          fontSize: 22,
          fontWeight: "800",
          color: colors.text,
          textTransform: "capitalize",
        },
        subtitle: { color: colors.textMuted, marginTop: 8, marginBottom: 8, lineHeight: 20 },
        switchRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingVertical: 18,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(165,145,175,0.2)",
        },
        switchCopy: { flex: 1 },
        switchTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
        switchHint: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
        doneBtn: { marginTop: 20, borderRadius: 14 },
      }),
    [colors]
  );

  const formatted = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.topBar}>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
          <Text style={styles.back}>{t("calendar_back")}</Text>
        </Pressable>
        <Text style={styles.topTitle}>{t("calendar_edit_day")}</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.dateTitle}>{formatted}</Text>
          <Text style={styles.subtitle}>
            {cycleEditingEnabled ? t("calendar_edit_hint") : t("calendar_day_no_period")}
          </Text>

          {cycleEditingEnabled ? (
            <>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchTitle}>{t("calendar_period_start")}</Text>
              <Text style={styles.switchHint}>{t("calendar_period_start_hint")}</Text>
            </View>
            <Switch
              value={isStart}
              onValueChange={onToggleStart}
              trackColor={{ false: "#D8D2E0", true: colors.lavender }}
              thumbColor={isStart ? colors.menstrualEnd : "#f4f3f4"}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchTitle}>{t("calendar_period_end")}</Text>
              <Text style={styles.switchHint}>{t("calendar_period_end_hint")}</Text>
            </View>
            <Switch
              value={isEnd}
              onValueChange={onToggleEnd}
              trackColor={{ false: "#D8D2E0", true: colors.lavender }}
              thumbColor={isEnd ? colors.menstrualEnd : "#f4f3f4"}
            />
          </View>
            </>
          ) : null}
        </View>

        <Button mode="contained" onPress={onClose} style={styles.doneBtn} buttonColor={colors.primary}>
          {t("calendar_done")}
        </Button>
      </ScrollView>
    </View>
  );
}
