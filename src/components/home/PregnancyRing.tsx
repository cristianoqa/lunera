import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Text } from "react-native-paper";
import { LuneraShadows, LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface Props {
  week: number;
  totalWeeks?: number;
  label: string;
}

export default function PregnancyRing({ week, totalWeeks = 40, label }: Props) {
  const colors = useAppTheme();
  const size = 268;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, week / totalWeeks);
  const offset = circumference * (1 - progress);

  return (
    <View style={[styles.outer, LuneraShadows.ringOuter]}>
      <View style={[styles.glassDisc, LuneraShadows.ringInner, { backgroundColor: colors.ringGlass }]}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidGlass]} />
        )}
      </View>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="preg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E879A9" />
            <Stop offset="100%" stopColor="#7C3AED" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringTrack}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#preg)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.day, { color: colors.text }]}>{week}</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.phaseSerif, { color: "#E879A9" }]}>
          {`de ${totalWeeks}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    alignSelf: "center",
    width: 268,
    height: 268,
    borderRadius: 134,
  },
  glassDisc: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 134,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },
  androidGlass: { backgroundColor: "rgba(255,255,255,0.72)" },
  svg: { position: "absolute" },
  center: { alignItems: "center", paddingHorizontal: 24 },
  day: { ...LuneraTypography.displayHuge, fontFamily: LuneraTypography.sans },
  sub: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: -4,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  phaseSerif: {
    fontFamily: LuneraTypography.serif,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 6,
    fontStyle: "italic",
  },
});
