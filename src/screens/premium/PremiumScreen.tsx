import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";

type PlanId = "monthly" | "yearly";

const PLANS: Record<PlanId, { price: string; periodKey: string }> = {
  monthly: { price: "2,99 €", periodKey: "premium_period_month" },
  yearly: { price: "19,99 €", periodKey: "premium_period_year" },
};

/**
 * Paywall IAP (stub RevenueCat).
 * Cancelación: en producción vía tienda; aquí demo revierte Pro al instante.
 */
export default function PremiumScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const config = useAppStore((s) => s.config);
  const setPremium = useAppStore((s) => s.setPremium);
  const updateConfig = useAppStore((s) => s.updateConfig);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanId>("yearly");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { paddingBottom: 40, backgroundColor: colors.bgLinen },
        hero: { margin: 16, borderRadius: 22, padding: 24, alignItems: "center" },
        heroTitle: {
          color: "#FFFFFF",
          fontSize: 26,
          fontWeight: "800",
          marginTop: 12,
          fontFamily: LuneraTypography.serif,
        },
        heroBody: {
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          marginTop: 10,
          lineHeight: 22,
          fontSize: 14,
        },
        card: {
          marginHorizontal: 16,
          backgroundColor: colors.surfaceGlass,
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.7)",
        },
        featRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 8 },
        featIcon: { marginLeft: 2 },
        feat: { flex: 1, color: colors.text, fontWeight: "600", fontSize: 15 },
        plans: { flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 16 },
        planCard: {
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 14,
          borderWidth: 2,
          borderColor: "rgba(165,145,175,0.25)",
          alignItems: "center",
        },
        planSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
        planPrice: { fontWeight: "900", fontSize: 20, color: colors.primary },
        planPeriod: { color: colors.textMuted, marginTop: 4, fontSize: 12 },
        planBadge: {
          marginTop: 8,
          fontSize: 11,
          fontWeight: "700",
          color: colors.accent,
        },
        legalNote: {
          marginHorizontal: 24,
          marginTop: 14,
          color: colors.textMuted,
          fontSize: 12,
          lineHeight: 17,
          textAlign: "center",
        },
        cta: {
          marginHorizontal: 16,
          marginTop: 16,
          backgroundColor: "#F5E6C8",
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: "center",
        },
        ctaPressed: { opacity: 0.92 },
        ctaDisabled: { opacity: 0.6 },
        ctaText: { color: "#3D2A5C", fontWeight: "800", fontSize: 15 },
        iapHint: {
          textAlign: "center",
          color: colors.textMuted,
          fontSize: 12,
          marginTop: 10,
          marginHorizontal: 24,
          lineHeight: 17,
        },
        restore: { marginTop: 16, alignItems: "center", padding: 8 },
        restoreText: { color: colors.primary, fontWeight: "700", fontSize: 14 },
        activeBox: { alignItems: "center", marginTop: 24, paddingHorizontal: 24 },
        active: { color: colors.success, fontWeight: "800", fontSize: 18, marginTop: 8 },
        thanks: { color: colors.textMuted, marginTop: 6, textAlign: "center" },
        cancelBtn: {
          marginTop: 18,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.pillRed,
        },
        cancelText: { color: colors.pillRed, fontWeight: "700" },
      }),
    [colors]
  );

  const purchasePro = async () => {
    setLoading(true);
    try {
      await setPremium(true);
      if (config) {
        await updateConfig({
          revenueCatCustomerId: `demo_${plan}_${Date.now()}`,
        });
      }
      Alert.alert(t("premium_title"), t("premium_purchase_ok"));
    } finally {
      setLoading(false);
    }
  };

  const cancelPro = () => {
    Alert.alert(t("premium_cancel_title"), t("premium_cancel_body"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("premium_cancel_confirm"),
        style: "destructive",
        onPress: async () => {
          await setPremium(false);
          if (config) await updateConfig({ revenueCatCustomerId: null });
          Alert.alert(t("premium_title"), t("premium_cancel_done"));
        },
      },
    ]);
  };

  const restorePurchases = async () => {
    if (config?.premiumActive) {
      Alert.alert(t("premium_title"), t("premium_active"));
      return;
    }
    Alert.alert(t("premium_restore"), t("premium_restore_empty"));
  };

  const features = [
    { icon: "file-document-outline" as const, label: t("premium_feat_pdf") },
    { icon: "chart-line" as const, label: t("premium_feat_insights") },
    { icon: "cloud-lock-outline" as const, label: t("premium_feat_sync") },
  ];

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={["#3D2A5C", "#6B3A6E", "#C45B7A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <MaterialCommunityIcons name="crown" size={36} color={colors.accent} />
        <Text style={styles.heroTitle}>{t("premium_title")}</Text>
        <Text style={styles.heroBody}>{t("premium_body")}</Text>
      </LinearGradient>

      <View style={styles.card}>
        {features.map((f) => (
          <View key={f.label} style={styles.featRow}>
            <MaterialCommunityIcons name="check-circle" size={22} color={colors.accent} />
            <MaterialCommunityIcons name={f.icon} size={18} color={colors.primary} style={styles.featIcon} />
            <Text style={styles.feat}>{f.label}</Text>
          </View>
        ))}
      </View>

      {!config?.premiumActive ? (
        <View style={styles.plans}>
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const p = PLANS[id];
            const selected = plan === id;
            return (
              <Pressable
                key={id}
                onPress={() => setPlan(id)}
                style={[styles.planCard, selected && styles.planSelected]}
              >
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={styles.planPeriod}>{t(p.periodKey)}</Text>
                {id === "yearly" ? <Text style={styles.planBadge}>{t("premium_best_value")}</Text> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Text style={styles.legalNote}>{t("premium_billing_note")}</Text>

      {config?.premiumActive ? (
        <View style={styles.activeBox}>
          <MaterialCommunityIcons name="check-decagram" size={28} color={colors.success} />
          <Text style={styles.active}>{t("premium_active")}</Text>
          <Text style={styles.thanks}>{t("premium_thanks")}</Text>
          <Pressable onPress={cancelPro} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{t("premium_cancel")}</Text>
          </Pressable>
          <Text style={styles.iapHint}>{t("premium_cancel_store_hint")}</Text>
        </View>
      ) : (
        <>
          <Pressable
            onPress={purchasePro}
            disabled={loading}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed, loading && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>
              {loading ? "⏳" : `${t("settings_pro_cta")} · ${PLANS[plan].price}`}
            </Text>
          </Pressable>
          <Text style={styles.iapHint}>{t("premium_iap_hint")}</Text>
          <Pressable onPress={restorePurchases} style={styles.restore}>
            <Text style={styles.restoreText}>{t("premium_restore")}</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
