import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Chip, Text, TextInput, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { LogSectionColors } from "../../constants/logColors";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import { todayISOLocal } from "../../services/cyclePredictor";
import { isPostpartumMode, resolveAppMode } from "../../services/lifeCycleService";
import {
  MOODS,
  SYMPTOMS,
  MUCUS_OPTIONS,
  SEX_OPTIONS,
  visibleExtraSymptoms,
} from "../../constants/symptoms";
import type {
  BleedingLevel,
  BleedingType,
  CervicalMucus,
  MenopauseDailySymptoms,
  MoodId,
  PainLevel,
  PregnancyAlertSymptomId,
  SexActivity,
  SymptomId,
} from "../../types/dailyLog";
import type { ExtraSymptomKey } from "../../constants/symptoms";

const BLEEDING_TYPES: BleedingType[] = ["period", "spotting", "withdrawal", "pregnancy", "postpartum", "other"];
const PREGNANCY_WARNING_OPTIONS: PregnancyAlertSymptomId[] = [
  "bleeding",
  "severe_pain",
  "fluid_loss",
  "headache",
  "reduced_fetal_movement",
];

function defaultMenopauseSymptoms(): MenopauseDailySymptoms {
  return {
    hotFlashes: 0,
    nightSweats: 0,
    sleepChanges: 0,
    moodChanges: 0,
    vaginalDryness: 0,
    brainFog: 0,
  };
}

function softForTheme(soft: string, isDark: boolean): string {
  if (!isDark) return soft;
  return soft.replace(/0\.1[2-4]\)/, "0.28)");
}

function Section({
  title,
  hint,
  accent,
  soft,
  hintColor,
  children,
}: {
  title: string;
  hint?: string;
  accent: string;
  soft: string;
  hintColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, { backgroundColor: soft, borderColor: `${accent}55` }]}>
      <View style={styles.sectionHead}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: accent }]}>{title}</Text>
          {hint ? <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function LevelPicker({
  value,
  onChange,
  accent,
  labels,
  surface,
  text,
  textMuted,
  border,
}: {
  value: number;
  onChange: (n: number) => void;
  accent: string;
  labels: string[];
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}) {
  return (
    <View style={styles.levelGrid}>
      {labels.map((label, n) => {
        const selected = value === n;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[
              styles.levelCell,
              { backgroundColor: surface, borderColor: border },
              selected && { backgroundColor: accent, borderColor: accent },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${n}: ${label}`}
          >
            <Text style={[styles.levelNum, { color: text }, selected && styles.levelNumOn]}>{n}</Text>
            <Text
              style={[styles.levelLabel, { color: textMuted }, selected && styles.levelLabelOn]}
              numberOfLines={2}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function LogScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const isDark = colors.id === "midnight";
  const profile = useAppStore((s) => s.profile);
  const prediction = useAppStore((s) => s.prediction);
  const logs = useAppStore((s) => s.logs);
  const config = useAppStore((s) => s.config);
  const upsertTodayLog = useAppStore((s) => s.upsertTodayLog);
  const today = todayISOLocal();
  const todayLog = logs.find((l) => l.date === today);
  const mode = resolveAppMode(config);
  const postpartum = isPostpartumMode(config);
  const extraKeys = useMemo(() => visibleExtraSymptoms(mode, postpartum), [mode, postpartum]);
  const showPill =
    mode === "CONTRACEPTION_CONTROL" &&
    (config?.contraception?.method === "pill_daily" || config?.contraception?.method === "mini_pill");

  const [bleeding, setBleeding] = useState<BleedingLevel>(todayLog?.bleeding ?? 0);
  const [pain, setPain] = useState<PainLevel>(todayLog?.pain ?? 0);
  const [moods, setMoods] = useState<MoodId[]>(todayLog?.moods ?? []);
  const [symptoms, setSymptoms] = useState<SymptomId[]>(todayLog?.symptoms ?? []);
  const [extraSymptoms, setExtraSymptoms] = useState<ExtraSymptomKey[]>(todayLog?.extraSymptoms ?? []);
  const [mucus, setMucus] = useState<CervicalMucus | null>(todayLog?.cervicalMucus ?? null);
  const [sex, setSex] = useState<SexActivity | null>(todayLog?.sex ?? null);
  const [pillTaken, setPillTaken] = useState<boolean | null>(todayLog?.pillTaken ?? null);
  const [notes, setNotes] = useState(todayLog?.notes ?? "");
  const [sleepHours, setSleepHours] = useState(String(todayLog?.lifestyle.sleepHours ?? ""));
  const [water, setWater] = useState(String(todayLog?.lifestyle.waterGlasses ?? ""));
  const [exercise, setExercise] = useState(String(todayLog?.lifestyle.exerciseMinutes ?? ""));
  const [stress, setStress] = useState<PainLevel>(todayLog?.lifestyle.stressLevel ?? 0);
  const [bleedingType, setBleedingType] = useState<BleedingType>(todayLog?.bleedingDetails?.type ?? "period");
  const [hasClots, setHasClots] = useState(Boolean(todayLog?.bleedingDetails?.hasClots));
  const [padCount, setPadCount] = useState(String(todayLog?.bleedingDetails?.padOrTamponCount ?? ""));
  const [bleedingNotes, setBleedingNotes] = useState(todayLog?.bleedingDetails?.notes ?? "");
  const [menopauseSymptoms, setMenopauseSymptoms] = useState<MenopauseDailySymptoms>(
    todayLog?.menopauseSymptoms ?? defaultMenopauseSymptoms()
  );
  const [fetalMovementCount, setFetalMovementCount] = useState(String(todayLog?.fetalMovement?.movementCount ?? ""));
  const [fetalMovementMinutes, setFetalMovementMinutes] = useState(String(todayLog?.fetalMovement?.durationMinutes ?? ""));
  const [fetalConcern, setFetalConcern] = useState(Boolean(todayLog?.fetalMovement?.concern));
  const [bloodPressureSys, setBloodPressureSys] = useState(String(todayLog?.bloodPressure?.systolic ?? ""));
  const [bloodPressureDia, setBloodPressureDia] = useState(String(todayLog?.bloodPressure?.diastolic ?? ""));
  const [pregnancyAlertSymptoms, setPregnancyAlertSymptoms] = useState<PregnancyAlertSymptomId[]>(
    todayLog?.pregnancyAlertSymptoms ?? []
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (todayLog) {
      setBleeding(todayLog.bleeding);
      setPain(todayLog.pain);
      setMoods(todayLog.moods);
      setSymptoms(todayLog.symptoms);
      setExtraSymptoms(todayLog.extraSymptoms ?? []);
      setMucus(todayLog.cervicalMucus ?? null);
      setSex(todayLog.sex ?? null);
      setPillTaken(todayLog.pillTaken ?? null);
      setNotes(todayLog.notes);
      setSleepHours(String(todayLog.lifestyle.sleepHours ?? ""));
      setWater(String(todayLog.lifestyle.waterGlasses ?? ""));
      setExercise(String(todayLog.lifestyle.exerciseMinutes ?? ""));
      setStress(todayLog.lifestyle.stressLevel ?? 0);
      setBleedingType(todayLog.bleedingDetails?.type ?? "period");
      setHasClots(Boolean(todayLog.bleedingDetails?.hasClots));
      setPadCount(String(todayLog.bleedingDetails?.padOrTamponCount ?? ""));
      setBleedingNotes(todayLog.bleedingDetails?.notes ?? "");
      setMenopauseSymptoms(todayLog.menopauseSymptoms ?? defaultMenopauseSymptoms());
      setFetalMovementCount(String(todayLog.fetalMovement?.movementCount ?? ""));
      setFetalMovementMinutes(String(todayLog.fetalMovement?.durationMinutes ?? ""));
      setFetalConcern(Boolean(todayLog.fetalMovement?.concern));
      setBloodPressureSys(String(todayLog.bloodPressure?.systolic ?? ""));
      setBloodPressureDia(String(todayLog.bloodPressure?.diastolic ?? ""));
      setPregnancyAlertSymptoms(todayLog.pregnancyAlertSymptoms ?? []);
    }
  }, [todayLog?.id, todayLog?.updatedAt]);

  const toggle = <T extends string>(list: T[], setList: (v: T[]) => void, id: T) => {
    setSaved(false);
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const togglePregnancyWarning = (id: PregnancyAlertSymptomId) => {
    setSaved(false);
    setPregnancyAlertSymptoms((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const onSave = async () => {
    try {
      await upsertTodayLog({
        date: today,
        bleeding,
        pain,
        moods,
        symptoms,
        extraSymptoms,
        cervicalMucus: mucus,
        sex,
        pillTaken: showPill ? pillTaken : null,
        notes,
        cycleDay: prediction?.currentCycleDay ?? null,
        phase: prediction?.currentPhase ?? null,
        lifestyle: {
          sleepHours: sleepHours ? Number(sleepHours) : null,
          exerciseMinutes: exercise ? Number(exercise) : null,
          waterGlasses: water ? Number(water) : null,
          stressLevel: stress,
        },
        bleedingDetails: {
          type: bleeding > 0 ? bleedingType : "none",
          flowLevel: bleeding,
          hasClots,
          padOrTamponCount: padCount ? Number(padCount) : null,
          notes: bleedingNotes.trim(),
        },
        menopauseSymptoms: mode === "MENOPAUSE_SUPPORT" ? menopauseSymptoms : null,
        fetalMovement:
          mode === "PREGNANCY_CARE" && (fetalMovementCount || fetalMovementMinutes || fetalConcern)
            ? {
                movementCount: fetalMovementCount ? Number(fetalMovementCount) : 0,
                durationMinutes: fetalMovementMinutes ? Number(fetalMovementMinutes) : 0,
                concern: fetalConcern,
              }
            : null,
        bloodPressure:
          mode === "PREGNANCY_CARE"
            ? {
                systolic: bloodPressureSys ? Number(bloodPressureSys) : null,
                diastolic: bloodPressureDia ? Number(bloodPressureDia) : null,
              }
            : null,
        pregnancyAlertSymptoms: mode === "PREGNANCY_CARE" ? pregnancyAlertSymptoms : [],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      Alert.alert(t("log_save"), t("log_save_error"));
    }
  };

  if (!profile) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.bgLinen }]}>
        <Text style={{ color: colors.textMuted, textAlign: "center" }}>{t("log_need_profile")}</Text>
      </View>
    );
  }

  const bleedLabels = [0, 1, 2, 3, 4, 5].map((n) => t(`log_bleed_${n}`));
  const painLabels = [0, 1, 2, 3, 4, 5].map((n) => t(`log_pain_${n}`));
  const stressLabels = [0, 1, 2, 3, 4, 5].map((n) => t(`log_stress_${n}`));
  const chipBorder = isDark ? "rgba(242,238,248,0.28)" : "rgba(165,145,175,0.28)";
  const chipSurface = isDark ? "rgba(255,255,255,0.08)" : colors.surface;
  const chipIdle = {
    backgroundColor: chipSurface,
    borderWidth: 1.5,
    borderColor: chipBorder,
  };
  const chipIdleText = { color: colors.text };

  const renderChip = (selected: boolean, label: string, onPress: () => void, accent: string) => (
    <Chip
      selected={selected}
      onPress={onPress}
      selectedColor="#fff"
      textStyle={selected ? { color: "#fff" } : chipIdleText}
      style={selected ? { backgroundColor: accent } : chipIdle}
    >
      {label}
    </Chip>
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.wrap, { backgroundColor: colors.bgLinen }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="titleLarge" style={[styles.title, { color: colors.text }]}>
        {t("log_title")}
      </Text>
      <Text style={[styles.dateLine, { color: colors.textMuted }]}>{today}</Text>

      {showPill ? (
        <Section
          title={t("log_pill")}
          hint={t("log_pill_hint")}
          accent={LogSectionColors.moods.accent}
          soft={softForTheme(LogSectionColors.moods.soft, isDark)}
          hintColor={colors.textMuted}
        >
          <View style={styles.row}>
            {renderChip(pillTaken === true, t("log_pill_taken"), () => {
              setSaved(false);
              setPillTaken(pillTaken === true ? null : true);
            }, LogSectionColors.moods.accent)}
            {renderChip(pillTaken === false, t("log_pill_missed"), () => {
              setSaved(false);
              setPillTaken(pillTaken === false ? null : false);
            }, LogSectionColors.pain.accent)}
          </View>
        </Section>
      ) : null}

      <Section
        title={t("log_bleeding")}
        hint={t("log_bleeding_hint")}
        accent={LogSectionColors.bleeding.accent}
        soft={softForTheme(LogSectionColors.bleeding.soft, isDark)}
        hintColor={colors.textMuted}
      >
        <LevelPicker
          value={bleeding}
          onChange={(n) => {
            setSaved(false);
            setBleeding(n as BleedingLevel);
          }}
          accent={LogSectionColors.bleeding.accent}
          labels={bleedLabels}
          surface={chipSurface}
          text={colors.text}
          textMuted={colors.textMuted}
          border={chipBorder}
        />
        {bleeding > 0 ? (
          <>
            <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t("log_bleeding_type")}</Text>
            <View style={styles.row}>
              {BLEEDING_TYPES.map((type) =>
                renderChip(bleedingType === type, t(`bleeding_type_${type}`), () => {
                  setSaved(false);
                  setBleedingType(type);
                }, LogSectionColors.bleeding.accent)
              )}
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              {renderChip(hasClots, t("log_bleeding_clots"), () => {
                setSaved(false);
                setHasClots((prev) => !prev);
              }, LogSectionColors.bleeding.accent)}
            </View>
            <TextInput
              mode="outlined"
              label={t("log_bleeding_products")}
              value={padCount}
              onChangeText={(value) => {
                setSaved(false);
                setPadCount(value);
              }}
              keyboardType="number-pad"
              style={[styles.input, { backgroundColor: colors.surface }]}
              textColor={colors.text}
              outlineColor={chipBorder}
              activeOutlineColor={colors.primary}
            />
            <TextInput
              mode="outlined"
              label={t("log_bleeding_notes")}
              value={bleedingNotes}
              onChangeText={(value) => {
                setSaved(false);
                setBleedingNotes(value);
              }}
              style={[styles.input, { backgroundColor: colors.surface }]}
              textColor={colors.text}
              outlineColor={chipBorder}
              activeOutlineColor={colors.primary}
            />
          </>
        ) : null}
      </Section>

      <Section
        title={t("log_mucus")}
        hint={t("log_mucus_hint")}
        accent={LogSectionColors.symptoms.accent}
        soft={softForTheme(LogSectionColors.symptoms.soft, isDark)}
        hintColor={colors.textMuted}
      >
        <View style={styles.row}>
          {MUCUS_OPTIONS.map((opt) =>
            renderChip(mucus === opt.id, t(opt.labelKey), () => {
              setSaved(false);
              setMucus(mucus === opt.id ? null : opt.id);
            }, LogSectionColors.symptoms.accent)
          )}
        </View>
      </Section>

      <Section
        title={t("log_pain")}
        hint={t("log_pain_hint")}
        accent={LogSectionColors.pain.accent}
        soft={softForTheme(LogSectionColors.pain.soft, isDark)}
        hintColor={colors.textMuted}
      >
        <LevelPicker
          value={pain}
          onChange={(n) => {
            setSaved(false);
            setPain(n as PainLevel);
          }}
          accent={LogSectionColors.pain.accent}
          labels={painLabels}
          surface={chipSurface}
          text={colors.text}
          textMuted={colors.textMuted}
          border={chipBorder}
        />
      </Section>

      <Section
        title={t("log_moods")}
        hint={t("log_moods_hint")}
        accent={LogSectionColors.moods.accent}
        soft={softForTheme(LogSectionColors.moods.soft, isDark)}
        hintColor={colors.textMuted}
      >
        <View style={styles.row}>
          {MOODS.map((m) =>
            renderChip(moods.includes(m.id), t(m.labelKey), () => toggle(moods, setMoods, m.id), LogSectionColors.moods.accent)
          )}
        </View>
      </Section>

      <Section
        title={t("log_sex")}
        hint={t("log_sex_hint")}
        accent={LogSectionColors.bleeding.accent}
        soft={softForTheme("rgba(196, 91, 122, 0.10)", isDark)}
        hintColor={colors.textMuted}
      >
        <View style={styles.row}>
          {SEX_OPTIONS.map((opt) =>
            renderChip(sex === opt.id, t(opt.labelKey), () => {
              setSaved(false);
              setSex(sex === opt.id ? null : opt.id);
            }, LogSectionColors.bleeding.accent)
          )}
        </View>
      </Section>

      <Section
        title={t("log_symptoms")}
        hint={t("log_symptoms_hint")}
        accent={LogSectionColors.symptoms.accent}
        soft={softForTheme(LogSectionColors.symptoms.soft, isDark)}
        hintColor={colors.textMuted}
      >
        <View style={styles.row}>
          {SYMPTOMS.map((s) =>
            renderChip(
              symptoms.includes(s.id),
              t(s.labelKey),
              () => toggle(symptoms, setSymptoms, s.id),
              LogSectionColors.symptoms.accent
            )
          )}
          {extraKeys.map((key) =>
            renderChip(
              extraSymptoms.includes(key),
              t(key),
              () => toggle(extraSymptoms, setExtraSymptoms, key),
              LogSectionColors.symptoms.accent
            )
          )}
        </View>
      </Section>

      <Section
        title={t("log_habits")}
        hint={t("log_stress_hint")}
        accent={LogSectionColors.lifestyle.accent}
        soft={softForTheme(LogSectionColors.lifestyle.soft, isDark)}
        hintColor={colors.textMuted}
      >
        <TextInput
          mode="outlined"
          label={t("log_sleep")}
          value={sleepHours}
          onChangeText={(v) => {
            setSaved(false);
            setSleepHours(v);
          }}
          keyboardType="decimal-pad"
          style={[styles.input, { backgroundColor: colors.surface }]}
          textColor={colors.text}
          outlineColor={chipBorder}
          activeOutlineColor={colors.primary}
        />
        <TextInput
          mode="outlined"
          label={t("log_water")}
          value={water}
          onChangeText={(v) => {
            setSaved(false);
            setWater(v);
          }}
          keyboardType="number-pad"
          style={[styles.input, { backgroundColor: colors.surface }]}
          textColor={colors.text}
          outlineColor={chipBorder}
          activeOutlineColor={colors.primary}
        />
        <TextInput
          mode="outlined"
          label={t("log_exercise")}
          value={exercise}
          onChangeText={(v) => {
            setSaved(false);
            setExercise(v);
          }}
          keyboardType="number-pad"
          style={[styles.input, { backgroundColor: colors.surface }]}
          textColor={colors.text}
          outlineColor={chipBorder}
          activeOutlineColor={colors.primary}
        />
        <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t("log_stress")}</Text>
        <LevelPicker
          value={stress}
          onChange={(n) => {
            setSaved(false);
            setStress(n as PainLevel);
          }}
          accent={LogSectionColors.lifestyle.accent}
          labels={stressLabels}
          surface={chipSurface}
          text={colors.text}
          textMuted={colors.textMuted}
          border={chipBorder}
        />
        <TextInput
          mode="outlined"
          label={t("log_notes")}
          value={notes}
          onChangeText={(v) => {
            setSaved(false);
            setNotes(v);
          }}
          multiline
          style={[styles.input, { backgroundColor: colors.surface }]}
          textColor={colors.text}
          outlineColor={chipBorder}
          activeOutlineColor={colors.primary}
        />
      </Section>

      {mode === "PREGNANCY_CARE" ? (
        <Section
          title={t("log_pregnancy_monitoring")}
          hint={t("log_pregnancy_monitoring_hint")}
          accent={LogSectionColors.pain.accent}
          soft={softForTheme("rgba(232,121,169,0.10)", isDark)}
          hintColor={colors.textMuted}
        >
          <TextInput
            mode="outlined"
            label={t("log_bp_systolic")}
            value={bloodPressureSys}
            onChangeText={(value) => {
              setSaved(false);
              setBloodPressureSys(value);
            }}
            keyboardType="number-pad"
            style={[styles.input, { backgroundColor: colors.surface }]}
            textColor={colors.text}
            outlineColor={chipBorder}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            mode="outlined"
            label={t("log_bp_diastolic")}
            value={bloodPressureDia}
            onChangeText={(value) => {
              setSaved(false);
              setBloodPressureDia(value);
            }}
            keyboardType="number-pad"
            style={[styles.input, { backgroundColor: colors.surface }]}
            textColor={colors.text}
            outlineColor={chipBorder}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            mode="outlined"
            label={t("log_fetal_moves")}
            value={fetalMovementCount}
            onChangeText={(value) => {
              setSaved(false);
              setFetalMovementCount(value);
            }}
            keyboardType="number-pad"
            style={[styles.input, { backgroundColor: colors.surface }]}
            textColor={colors.text}
            outlineColor={chipBorder}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            mode="outlined"
            label={t("log_fetal_minutes")}
            value={fetalMovementMinutes}
            onChangeText={(value) => {
              setSaved(false);
              setFetalMovementMinutes(value);
            }}
            keyboardType="number-pad"
            style={[styles.input, { backgroundColor: colors.surface }]}
            textColor={colors.text}
            outlineColor={chipBorder}
            activeOutlineColor={colors.primary}
          />
          <View style={styles.row}>
            {renderChip(fetalConcern, t("log_fetal_concern"), () => {
              setSaved(false);
              setFetalConcern((prev) => !prev);
            }, LogSectionColors.pain.accent)}
          </View>
          <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t("log_warning_signs")}</Text>
          <View style={styles.row}>
            {PREGNANCY_WARNING_OPTIONS.map((item) =>
              renderChip(
                pregnancyAlertSymptoms.includes(item),
                t(`preg_warning_${item}`),
                () => togglePregnancyWarning(item),
                LogSectionColors.pain.accent
              )
            )}
          </View>
        </Section>
      ) : null}

      {mode === "MENOPAUSE_SUPPORT" ? (
        <Section
          title={t("log_menopause")}
          hint={t("log_menopause_hint")}
          accent={LogSectionColors.symptoms.accent}
          soft={softForTheme("rgba(139,123,168,0.10)", isDark)}
          hintColor={colors.textMuted}
        >
          {[
            ["hotFlashes", "meno_hot_flashes"],
            ["nightSweats", "meno_night_sweats"],
            ["sleepChanges", "meno_sleep_changes"],
            ["moodChanges", "meno_mood_changes"],
            ["vaginalDryness", "meno_vaginal_dryness"],
            ["brainFog", "meno_brain_fog"],
          ].map(([key, labelKey]) => (
            <View key={key}>
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t(labelKey)}</Text>
              <LevelPicker
                value={menopauseSymptoms[key as keyof MenopauseDailySymptoms]}
                onChange={(value) => {
                  setSaved(false);
                  setMenopauseSymptoms((prev) => ({ ...prev, [key]: value as PainLevel }));
                }}
                accent={LogSectionColors.symptoms.accent}
                labels={stressLabels}
                surface={chipSurface}
                text={colors.text}
                textMuted={colors.textMuted}
                border={chipBorder}
              />
            </View>
          ))}
        </Section>
      ) : null}

      <Button
        mode="contained"
        onPress={onSave}
        style={styles.btn}
        buttonColor={colors.primary}
        textColor={isDark ? colors.primaryDeep : "#fff"}
      >
        {saved ? t("log_saved") : t("log_save")}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 130 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontWeight: "800" },
  dateLine: { marginBottom: 16, marginTop: 4 },
  section: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  sectionHead: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  label: { fontWeight: "800", fontSize: 13, letterSpacing: 0.3, textTransform: "uppercase" },
  hint: { fontSize: 12, marginTop: 3, lineHeight: 17, fontWeight: "500" },
  subLabel: { fontSize: 12, fontWeight: "700", marginTop: 12, marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  levelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  levelCell: {
    width: "30.5%",
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  levelNum: { fontSize: 18, fontWeight: "800" },
  levelNumOn: { color: "#fff" },
  levelLabel: { fontSize: 11, textAlign: "center", marginTop: 2, fontWeight: "600" },
  levelLabelOn: { color: "rgba(255,255,255,0.92)" },
  input: { marginTop: 8 },
  btn: { marginTop: 12, borderRadius: 14 },
});
