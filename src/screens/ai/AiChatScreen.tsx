import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LuneraShadows, LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import { resolveAppMode } from "../../services/lifeCycleService";
import { pregnancyProgress } from "../../services/pregnancyService";
import { todayISOLocal } from "../../services/cyclePredictor";
import {
  AI_DISCLAIMER,
  askLuneraAi,
  buildAiContextFromStore,
  detectMedicalEmergency,
} from "../../services/luneraAiService";

type Bubble =
  | { id: string; role: "user" | "assistant"; text: string }
  | { id: string; role: "emergency"; text: string };

export default function AiChatScreen({ navigation }: { navigation?: any }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colors = useAppTheme();
  const prediction = useAppStore((s) => s.prediction);
  const logs = useAppStore((s) => s.logs);
  const cycles = useAppStore((s) => s.cycles);
  const config = useAppStore((s) => s.config);
  const clinicalAlerts = useAppStore((s) => s.clinicalAlerts);
  const listRef = useRef<FlatList>(null);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Bubble[]>([
    { id: "welcome", role: "assistant", text: t("ai_welcome") },
  ]);

  const ctx = useMemo(() => {
    const mode = resolveAppMode(config);
    const week =
      mode === "PREGNANCY_CARE" && config?.pregnancy?.lastMenstrualPeriod
        ? pregnancyProgress(config.pregnancy.lastMenstrualPeriod, todayISOLocal()).week
        : null;
    return buildAiContextFromStore({
      prediction,
      logs,
      cycles,
      locale: config?.locale,
      appMode: mode,
      pregnancyWeek: week,
      clinicalAlerts,
    });
  }, [prediction, logs, cycles, config, clinicalAlerts]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    if (!ctx) {
      Alert.alert(t("ai_chat_title"), t("home_empty"));
      return;
    }
    setInput("");
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text }]);

    if (detectMedicalEmergency(text)) {
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: "emergency", text: t("ai_emergency_body") }]);
      return;
    }

    setBusy(true);
    try {
      const result = await askLuneraAi(text, ctx);
      if (result.kind === "emergency") {
        setMessages((m) => [...m, { id: `e-${Date.now()}`, role: "emergency", text: result.text }]);
      } else {
        setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", text: result.text }]);
      }
    } finally {
      setBusy(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  const callEmergency = () => {
    Alert.alert(t("ai_emergency_call_title"), t("ai_emergency_call_body"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("ai_emergency_call_action"), onPress: () => Linking.openURL("tel:112") },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bgLinen }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 24}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            if (item.role === "emergency") {
              return (
                <View style={styles.emergencyCard}>
                  <MaterialCommunityIcons name="alert-octagon" size={28} color="#B91C1C" />
                  <Text style={styles.emergencyTitle}>{t("ai_emergency_title")}</Text>
                  <Text style={styles.emergencyBody}>{item.text}</Text>
                  <Pressable style={styles.emergencyBtn} onPress={callEmergency}>
                    <Text style={styles.emergencyBtnText}>{t("ai_emergency_call_action")}</Text>
                  </Pressable>
                  <Pressable style={styles.emergencySecondary} onPress={() => navigation?.goBack?.()}>
                    <Text style={styles.emergencySecondaryText}>{t("ai_emergency_close")}</Text>
                  </Pressable>
                </View>
              );
            }
            const mine = item.role === "user";
            return (
              <View
                style={[
                  styles.bubble,
                  mine
                    ? { alignSelf: "flex-end", backgroundColor: colors.primary }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: colors.surfaceGlass,
                        borderWidth: 1,
                        borderColor: "rgba(165,145,175,0.18)",
                      },
                ]}
              >
                <Text style={[styles.bubbleText, { color: mine ? "#fff" : colors.text }]}>{item.text}</Text>
              </View>
            );
          }}
        />

        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>{AI_DISCLAIMER}</Text>

        <View
          style={[
            styles.composer,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: colors.surfaceGlass,
              borderTopColor: "rgba(165,145,175,0.25)",
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: "rgba(165,145,175,0.35)",
              },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder={t("ai_placeholder")}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            editable={!busy}
            autoFocus
          />
          <Pressable
            style={[styles.send, { backgroundColor: colors.primary }, (!input.trim() || busy) && styles.sendDisabled]}
            onPress={send}
            disabled={!input.trim() || busy}
            accessibilityRole="button"
            accessibilityLabel={t("ai_ask_cta")}
          >
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  list: { padding: 16, gap: 10, paddingBottom: 20 },
  bubble: {
    maxWidth: "88%",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...LuneraShadows.card,
  },
  bubbleText: { lineHeight: 22, fontSize: 15 },
  emergencyCard: {
    backgroundColor: "#FDECEC",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F5C2C2",
    gap: 8,
  },
  emergencyTitle: { fontWeight: "800", color: "#7F1D1D", fontSize: 16 },
  emergencyBody: { color: "#7F1D1D", lineHeight: 22 },
  emergencyBtn: {
    marginTop: 8,
    backgroundColor: "#B91C1C",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  emergencyBtnText: { color: "#fff", fontWeight: "800" },
  emergencySecondary: { paddingVertical: 10, alignItems: "center" },
  emergencySecondaryText: { color: "#7F1D1D", fontWeight: "700" },
  disclaimer: { fontSize: 11, lineHeight: 16, paddingHorizontal: 16, paddingBottom: 8 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    fontFamily: LuneraTypography.sans,
    fontSize: 16,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.45 },
});
