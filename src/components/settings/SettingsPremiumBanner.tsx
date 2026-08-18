import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LuneraColors, LuneraShadows, LuneraTypography } from "../../constants/theme";

interface Props {
  title: string;
  subtitle: string;
  cta: string;
  features: string[];
  active: boolean;
  activeLabel: string;
  onPress: () => void;
}

export default function SettingsPremiumBanner({
  title,
  subtitle,
  cta,
  features,
  active,
  activeLabel,
  onPress,
}: Props) {
  return (
    <View style={[styles.wrap, LuneraShadows.card]}>
      <LinearGradient
        colors={["#3D2A5C", "#6B3A6E", "#C45B7A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="crown" size={18} color={LuneraColors.accent} />
          <Text style={styles.badge}>{active ? activeLabel : title}</Text>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {features.map((f) => (
          <View key={f} style={styles.featRow}>
            <MaterialCommunityIcons name="check-circle" size={18} color={LuneraColors.accent} />
            <Text style={styles.feat}>{f}</Text>
          </View>
        ))}

        {!active ? (
          <Pressable onPress={onPress} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
            <Text style={styles.ctaText}>{cta}</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#3D2A5C" />
          </Pressable>
        ) : (
          <Pressable onPress={onPress} style={styles.ctaGhost}>
            <Text style={styles.ctaGhostText}>{activeLabel}</Text>
          </Pressable>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 22,
    overflow: "hidden",
  },
  gradient: { padding: 20 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  badge: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
    fontFamily: LuneraTypography.serif,
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  featRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  feat: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", flex: 1 },
  cta: {
    marginTop: 14,
    backgroundColor: "#F5E6C8",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  ctaText: {
    color: "#3D2A5C",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  ctaGhost: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaGhostText: { color: "#FFFFFF", fontWeight: "700" },
});
