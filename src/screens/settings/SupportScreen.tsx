import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Linking } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";

const SUPPORT_EMAIL = "soporte.flowhomeapps@gmail.com";

export default function SupportScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { padding: 24, backgroundColor: colors.background },
        title: { fontWeight: "800", color: colors.text },
        body: { color: colors.textMuted, marginVertical: 12 },
        input: { backgroundColor: colors.surface, minHeight: 120 },
        btn: { marginTop: 16, borderRadius: 12 },
      }),
    [colors]
  );

  const send = () => {
    const subject = encodeURIComponent(t("support_subject"));
    const body = encodeURIComponent(message || "(sin mensaje)");
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
    setSent(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text variant="titleLarge" style={styles.title}>
        {t("support_title")}
      </Text>
      <Text style={styles.body}>{t("support_body")}</Text>
      <TextInput
        mode="outlined"
        label={t("support_message")}
        value={message}
        onChangeText={setMessage}
        multiline
        style={styles.input}
      />
      <Button mode="contained" onPress={send} style={styles.btn}>
        {sent ? t("support_sent") : t("support_send")}
      </Button>
    </ScrollView>
  );
}
