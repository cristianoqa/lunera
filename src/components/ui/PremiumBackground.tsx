import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LuneraColors, PhaseBackgrounds } from "../../constants/theme";
import type { CyclePhase } from "../../types/cycle";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  phase?: CyclePhase;
}

/** Alias legacy — delega en paleta wellness por fase */
export default function PremiumBackground({ children, style, phase = "follicular" }: Props) {
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
  fill: { flex: 1, backgroundColor: LuneraColors.bgLinen },
});
