import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line, Text as SvgText, Circle, Polyline } from "react-native-svg";
import { Text } from "react-native-paper";
import { LuneraColors } from "../../constants/theme";

export interface ChartPoint {
  label: string;
  value: number;
}

interface BarProps {
  title: string;
  points: ChartPoint[];
  maxValue?: number;
  color?: string;
  emptyLabel: string;
}

export function InsightBarChart({ title, points, maxValue = 5, color = LuneraColors.primary, emptyLabel }: BarProps) {
  const width = 320;
  const height = 140;
  const padL = 28;
  const padB = 28;
  const padT = 12;
  const chartW = width - padL - 8;
  const chartH = height - padB - padT;

  if (!points.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>{emptyLabel}</Text>
      </View>
    );
  }

  const barW = Math.max(8, chartW / points.length - 6);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#E8E0F0" strokeWidth={1} />
        <Line x1={padL} y1={padT + chartH} x2={width - 8} y2={padT + chartH} stroke="#E8E0F0" strokeWidth={1} />
        {points.map((p, i) => {
          const h = (Math.min(maxValue, Math.max(0, p.value)) / maxValue) * chartH;
          const x = padL + 4 + i * (chartW / points.length);
          const y = padT + chartH - h;
          return (
            <React.Fragment key={`${p.label}-${i}`}>
              <Rect x={x} y={y} width={barW} height={Math.max(2, h)} rx={4} fill={color} opacity={0.85} />
              <SvgText x={x + barW / 2} y={height - 8} fontSize="9" fill={LuneraColors.textMuted} textAnchor="middle">
                {p.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

interface LineProps {
  title: string;
  points: ChartPoint[];
  maxValue?: number;
  color?: string;
  emptyLabel: string;
}

export function InsightLineChart({ title, points, maxValue = 5, color = LuneraColors.menstrualStart, emptyLabel }: LineProps) {
  const width = 320;
  const height = 140;
  const padL = 28;
  const padB = 28;
  const padT = 12;
  const chartW = width - padL - 8;
  const chartH = height - padB - padT;

  if (points.length < 2) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>{emptyLabel}</Text>
      </View>
    );
  }

  const coords = points.map((p, i) => {
    const x = padL + (i / (points.length - 1)) * chartW;
    const y = padT + chartH - (Math.min(maxValue, Math.max(0, p.value)) / maxValue) * chartH;
    return { x, y, label: p.label };
  });
  const poly = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={padL} y1={padT + chartH} x2={width - 8} y2={padT + chartH} stroke="#E8E0F0" strokeWidth={1} />
        <Polyline points={poly} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <React.Fragment key={i}>
            <Circle cx={c.x} cy={c.y} r={4} fill={color} />
            <SvgText x={c.x} y={height - 8} fontSize="9" fill={LuneraColors.textMuted} textAnchor="middle">
              {c.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LuneraColors.surfaceGlass,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  title: { fontWeight: "700", color: LuneraColors.text, marginBottom: 8, fontSize: 14 },
  empty: { color: LuneraColors.textMuted, fontSize: 13, paddingVertical: 20, textAlign: "center" },
});
