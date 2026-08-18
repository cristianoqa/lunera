import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import type { SymptomPill } from "../../utils/symptomSummary";

interface Props {
  pills: SymptomPill[];
}

export default function SymptomPills({ pills }: Props) {
  return (
    <View style={styles.row}>
      {pills.map((p) => (
        <View key={p.id} style={[styles.pill, { backgroundColor: p.bg }]}>
          <View style={[styles.dot, { backgroundColor: p.color }]} />
          <Text style={[styles.text, { color: p.color }]}>{p.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 12, fontWeight: "700" },
});
