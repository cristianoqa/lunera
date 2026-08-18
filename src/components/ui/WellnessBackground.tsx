import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PhaseBackgrounds } from "../../constants/theme";
import type { CyclePhase } from "../../types/cycle";

interface Props {
  phase?: CyclePhase;
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Fondo wellness dinámico según fase del ciclo */
export default function WellnessBackground({ phase = "follicular", children, style }: Props) {
  const [c0, c1, c2] = PhaseBackgrounds[phase];

  return (
    <LinearGradient
      colors={[c0, c1, c2]}
      locations={[0, 0.45, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
