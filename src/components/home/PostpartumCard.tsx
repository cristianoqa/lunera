import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OrganicCard from "../ui/OrganicCard";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface Props {
  title: string;
  body: string;
}

export default function PostpartumCard({ title, body }: Props) {
  const colors = useAppTheme();
  return (
    <OrganicCard>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <MaterialCommunityIcons name="heart-outline" size={20} color={colors.bronze} />
        </View>
        <Text style={[styles.kicker, { color: colors.accent }]}>{title}</Text>
      </View>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
    </OrganicCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { fontWeight: "700", fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase", flex: 1 },
  body: { ...LuneraTypography.body },
});
