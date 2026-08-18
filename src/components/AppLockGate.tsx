import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Button } from "react-native-paper";
import * as LocalAuthentication from "expo-local-authentication";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/appStore";
import { useAppTheme } from "../theme/AppThemeProvider";

export default function AppLockGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const config = useAppStore((s) => s.config);
  const lockOn = !!config?.appLockEnabled;
  const [unlocked, setUnlocked] = useState(!lockOn);
  const [prompting, setPrompting] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: colors.bgLinen,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        },
        logo: {
          width: 88,
          height: 88,
          borderRadius: 22,
          marginBottom: 16,
        },
        title: { color: colors.text, fontWeight: "800", marginBottom: 12 },
        body: { color: colors.textMuted, textAlign: "center", marginBottom: 24, lineHeight: 22 },
        btn: { borderRadius: 12, minWidth: 180 },
      }),
    [colors]
  );

  useEffect(() => {
    if (!lockOn) {
      setUnlocked(true);
      return;
    }
    setUnlocked(false);
    let cancelled = false;
    (async () => {
      setPrompting(true);
      try {
        const hw = await LocalAuthentication.hasHardwareAsync();
        if (!hw) {
          if (!cancelled) setUnlocked(true);
          return;
        }
        const { success } = await LocalAuthentication.authenticateAsync({
          promptMessage: t("lock_prompt"),
        });
        if (!cancelled && success) setUnlocked(true);
      } finally {
        if (!cancelled) setPrompting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lockOn, t]);

  const unlock = async () => {
    setPrompting(true);
    try {
      const hw = await LocalAuthentication.hasHardwareAsync();
      if (!hw) {
        setUnlocked(true);
        return;
      }
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: t("lock_prompt"),
      });
      if (success) setUnlocked(true);
    } finally {
      setPrompting(false);
    }
  };

  if (!lockOn || unlocked) return <>{children}</>;

  return (
    <View style={styles.overlay}>
      <Image source={require("../../assets/icon.png")} style={styles.logo} accessibilityLabel="Lunera" />
      <Text variant="headlineSmall" style={styles.title}>
        Lunera
      </Text>
      <Text style={styles.body}>{prompting ? t("lock_checking") : t("lock_body")}</Text>
      {!prompting ? (
        <Button mode="contained" onPress={unlock} style={styles.btn} buttonColor="#fff" textColor={colors.primaryDark}>
          {t("lock_unlock")}
        </Button>
      ) : null}
    </View>
  );
}
