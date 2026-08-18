import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Text } from "react-native-paper";
import { LuneraShadows, LuneraTypography, PhaseRingGradients } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { CyclePhase } from "../../types/cycle";

interface Props {
  cycleDay: number;
  cycleLength: number;
  phase: CyclePhase;
  label: string;
  phaseLabel?: string;
  fertileStartDay?: number;
  fertileEndDay?: number;
}

export default function CycleRing({
  cycleDay,
  cycleLength,
  phase,
  label,
  phaseLabel,
  fertileStartDay,
  fertileEndDay,
}: Props) {
  const colors = useAppTheme();
  const size = 268;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, cycleDay / cycleLength);
  const offset = circumference * (1 - progress);
  const [gradStart, gradEnd] = PhaseRingGradients[phase];
  const gradId = `phase-${phase}`;
  const fertileGradId = "fertile-arc";

  const fertileArc =
    fertileStartDay && fertileEndDay
      ? {
          start: ((fertileStartDay - 1) / cycleLength) * circumference,
          len: ((fertileEndDay - fertileStartDay + 1) / cycleLength) * circumference,
        }
      : null;

  return (
    <View style={[styles.outer, LuneraShadows.ringOuter]}>
      <View
        style={[
          styles.glassDisc,
          LuneraShadows.ringInner,
          { backgroundColor: colors.ringGlass },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidGlass]} />
        )}
      </View>

      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradStart} />
            <Stop offset="100%" stopColor={gradEnd} />
          </LinearGradient>
          <LinearGradient id={fertileGradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.fertileStart} />
            <Stop offset="100%" stopColor={colors.fertileEnd} />
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

        {fertileArc && phase !== "menstrual" ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${fertileGradId})`}
            strokeWidth={stroke - 6}
            fill="none"
            strokeDasharray={`${fertileArc.len} ${circumference}`}
            strokeDashoffset={-fertileArc.start}
            strokeLinecap="round"
            opacity={0.45}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        ) : null}

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradId})`}
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
        <Text style={[styles.day, { color: colors.text }]}>{cycleDay}</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.phaseSerif, { color: gradStart }]}>{phaseLabel ?? phase}</Text>
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
  androidGlass: {
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  svg: { position: "absolute" },
  center: { alignItems: "center", paddingHorizontal: 24 },
  day: {
    ...LuneraTypography.displayHuge,
    fontFamily: LuneraTypography.sans,
  },
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
    textTransform: "capitalize",
    fontStyle: "italic",
  },
});
