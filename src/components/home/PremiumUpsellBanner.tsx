import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LuneraShadows, LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface Props {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function PremiumUpsellBanner({ title, subtitle, onPress }: Props) {
  const colors = useAppTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="file-document-outline" size={22} color={colors.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    ...LuneraShadows.card,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  title: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: LuneraTypography.serif,
  },
  sub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
});
