import React, { useMemo } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import CycleRing from "../../components/cycle/CycleRing";
import WellnessBackground from "../../components/ui/WellnessBackground";
import BodyTodayCard from "../../components/home/BodyTodayCard";
import PeriodInsightCard from "../../components/home/PeriodInsightCard";
import LogsInsightCard from "../../components/home/LogsInsightCard";
import PregnancyRing from "../../components/home/PregnancyRing";
import PregnancyWeekCard from "../../components/home/PregnancyWeekCard";
import PostpartumCard from "../../components/home/PostpartumCard";
import ContraceptionCard from "../../components/home/ContraceptionCard";
import MenopausePanel from "../../components/home/MenopausePanel";
import LifeStageChip from "../../components/home/LifeStageChip";
import ClinicalAlertsCard from "../../components/home/ClinicalAlertsCard";
import PrenatalChecklist from "../../components/home/PrenatalChecklist";
import { buildAiContextFromStore, generateBodyTodayAi } from "../../services/luneraAiService";
import { summarizeRecentSymptoms } from "../../utils/symptomSummary";
import { resolveAppMode, isPostpartumMode, shouldPredictPeriods } from "../../services/lifeCycleService";
import { pregnancyMilestoneHint, pregnancyProgress } from "../../services/pregnancyService";
import { getMenopauseAdvice } from "../../content/menopauseAdvice";
import { todayISOLocal } from "../../services/cyclePredictor";
import { loggingStreak } from "../../services/adherenceService";
import { phaseCareCopy } from "../../services/phaseCareService";
import { toggleVisitId } from "../../services/prenatalVisitService";
import OrganicCard from "../../components/ui/OrganicCard";
import PremiumUpsellBanner from "../../components/home/PremiumUpsellBanner";
import { SCENE_TAB_CLEARANCE } from "../../utils/tabBarLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showPremiumComingSoon } from "../../services/premiumGate";

const LUTEAL_PHASE_DAYS = 14;

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const prediction = useAppStore((s) => s.prediction);
  const logs = useAppStore((s) => s.logs);
  const cycles = useAppStore((s) => s.cycles);
  const config = useAppStore((s) => s.config);
  const updateConfig = useAppStore((s) => s.updateConfig);
  const clinicalAlerts = useAppStore((s) => s.clinicalAlerts);

  const mode = resolveAppMode(config);
  const postpartum = isPostpartumMode(config);
  const today = todayISOLocal();

  const symptomPills = useMemo(() => summarizeRecentSymptoms(logs, t), [logs, t, i18n.language]);

  const fertileDays = useMemo(() => {
    if (!prediction || !shouldPredictPeriods(config)) return { start: undefined, end: undefined };
    const ovulationDay = Math.max(
      prediction.averagePeriodLength + 1,
      prediction.averageCycleLength - LUTEAL_PHASE_DAYS
    );
    return { start: ovulationDay - 5, end: ovulationDay + 1 };
  }, [prediction, config]);

  const pregnancy = useMemo(() => {
    if (mode !== "PREGNANCY_CARE" || !config?.pregnancy?.lastMenstrualPeriod) return null;
    return {
      ...pregnancyProgress(config.pregnancy.lastMenstrualPeriod, today),
      dueDate: config.pregnancy.dueDate,
    };
  }, [mode, config, today]);

  const bodyInsight = useMemo(() => {
    const ctx = buildAiContextFromStore({
      prediction,
      logs,
      cycles,
      locale: i18n.language,
      appMode: mode,
      pregnancyWeek: pregnancy?.week ?? null,
      clinicalAlerts,
    });
    return generateBodyTodayAi(ctx);
  }, [prediction, logs, cycles, i18n.language, mode, pregnancy?.week, clinicalAlerts]);

  const menopauseAdvice = useMemo(() => getMenopauseAdvice(today), [today]);

  const openCalendar = () => {
    navigation.navigate("CalendarTab");
  };

  const openLog = () => {
    navigation.navigate("LogTab");
  };

  const openLifeMode = () => {
    navigation.navigate("SettingsTab", { screen: "LifeMode" });
  };

  const openAi = () => {
    const root = navigation.getParent()?.getParent() ?? navigation.getParent() ?? navigation;
    root.navigate("AiChat");
  };

  const onBabyBorn = () => {
    if (!config?.pregnancy) return;
    Alert.alert(t("preg_born_title"), t("preg_born_confirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("preg_born_cta"),
        onPress: () =>
          updateConfig({
            pregnancy: { ...config.pregnancy!, babyBornAt: todayISOLocal() },
          }),
      },
    ]);
  };

  if (!prediction && mode === "MENSTRUATION_TRACKING") {
    return (
      <WellnessBackground style={styles.emptyWrap}>
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>{t("home_empty")}</Text>
      </WellnessBackground>
    );
  }

  const phase =
    mode === "MENOPAUSE_SUPPORT"
      ? "luteal"
      : mode === "PREGNANCY_CARE"
        ? "ovulation"
        : prediction?.currentPhase ?? "follicular";

  return (
    <WellnessBackground phase={phase}>
      <ScrollView
        contentContainerStyle={[
          styles.wrap,
          { paddingTop: 24 + Math.max(insets.top, 12), paddingBottom: SCENE_TAB_CLEARANCE },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.greeting, { color: colors.text }]}>{t("home_title")}</Text>
        <Text style={[styles.subGreeting, { color: colors.textMuted }]}>{t("home_subtitle")}</Text>
        <LifeStageChip
          kicker={t("life_mode_title")}
          label={t(`life_mode_${mode}`)}
          onPress={openLifeMode}
        />

        <ClinicalAlertsCard title={t("home_alerts_title")} alerts={clinicalAlerts} translate={t} />

        {loggingStreak(logs.map((l) => l.date), today) > 0 ? (
          <OrganicCard>
            <Text style={{ color: colors.textMuted, fontWeight: "700" }}>{t("home_streak")}</Text>
            <Text style={{ color: colors.text, fontWeight: "800", marginTop: 4 }}>
              {t("home_streak_days", { count: loggingStreak(logs.map((l) => l.date), today) })}
            </Text>
          </OrganicCard>
        ) : null}

        <LogsInsightCard
          label={t("home_logs")}
          pills={symptomPills}
          emptyHint={t("home_logs_empty")}
          caption={t("home_logs_keep")}
          onPress={openLog}
        />

        {mode === "PREGNANCY_CARE" && postpartum ? (
          <PostpartumCard title={t("preg_postpartum_title")} body={t("preg_postpartum_body")} />
        ) : null}

        {mode === "PREGNANCY_CARE" && !postpartum && pregnancy ? (
          <>
            <PregnancyRing week={pregnancy.week} label={t("preg_week_label")} />
            <PregnancyWeekCard
              week={pregnancy.week}
              dueDate={pregnancy.dueDate}
              copy={pregnancy.copy}
              checklistLine={pregnancyMilestoneHint(pregnancy.week)}
              bornLabel={t("preg_born_cta")}
              onBabyBorn={onBabyBorn}
            />
            <PrenatalChecklist
              week={pregnancy.week}
              completedIds={config?.pregnancy?.prenatalVisitNotes ?? []}
              title={t("prenatal_title")}
              translate={t}
              onToggle={(visitId) => {
                if (!config?.pregnancy) return;
                updateConfig({
                  pregnancy: {
                    ...config.pregnancy,
                    prenatalVisitNotes: toggleVisitId(config.pregnancy.prenatalVisitNotes ?? [], visitId),
                  },
                });
              }}
            />
          </>
        ) : null}

        {mode === "CONTRACEPTION_CONTROL" && config?.contraception ? (
          <ContraceptionCard
            method={config.contraception.method}
            timeLabel={
              config.contraception.method === "pill_daily" || config.contraception.method === "mini_pill"
                ? config.contraception.reminderTime
                : ""
            }
            title={t(`life_method_${config.contraception.method}`)}
            body={t(`life_contra_body_${config.contraception.method}`)}
          />
        ) : null}

        {mode === "MENOPAUSE_SUPPORT" ? (
          <MenopausePanel
            kicker={t("meno_kicker")}
            advice={menopauseAdvice}
            symptomScore={
              typeof config?.menopause?.mrsScore === "number"
                ? config.menopause.mrsScore
                : logs[0]?.menopauseSymptoms
                  ? Object.values(logs[0].menopauseSymptoms).reduce((sum, value) => sum + value, 0)
                  : null
            }
          />
        ) : null}

        {mode === "MENSTRUATION_TRACKING" && prediction ? (
          <CycleRing
            cycleDay={prediction.currentCycleDay}
            cycleLength={prediction.averageCycleLength}
            phase={prediction.currentPhase}
            label={t("home_cycle_day")}
            phaseLabel={t(`phase_${prediction.currentPhase}`)}
            fertileStartDay={fertileDays.start}
            fertileEndDay={fertileDays.end}
          />
        ) : null}

        <BodyTodayCard
          title={t("home_body_today")}
          insight={bodyInsight}
          askLabel={t("ai_ask_cta")}
          onAskAi={openAi}
          careTitle={t("home_care_title")}
          careEmotion={t(phaseCareCopy(prediction?.currentPhase).emotionKey)}
          careNutrition={t(phaseCareCopy(prediction?.currentPhase).nutritionKey)}
          disclaimer={t("ai_disclaimer")}
        />

        {showPremiumComingSoon() && !config?.premiumActive ? (
          <PremiumUpsellBanner
            title={t("home_pro_soon_title")}
            subtitle={t("home_pro_soon_sub")}
            onPress={() => navigation.navigate("SettingsTab", { screen: "Premium" })}
          />
        ) : null}

        {mode === "MENSTRUATION_TRACKING" && prediction ? (
          <PeriodInsightCard
            label={t("home_next_period")}
            value={`${prediction.daysUntilPeriod} ${t("home_days")}`}
            fertileHint={`${t("home_fertile")}: ${prediction.fertileWindowStart} → ${prediction.fertileWindowEnd}`}
            onPress={openCalendar}
          />
        ) : null}
      </ScrollView>
    </WellnessBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingBottom: SCENE_TAB_CLEARANCE },
  emptyWrap: { justifyContent: "center", alignItems: "center", padding: 24 },
  greeting: {
    ...LuneraTypography.title,
  },
  subGreeting: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 4,
    fontWeight: "500",
  },
});
