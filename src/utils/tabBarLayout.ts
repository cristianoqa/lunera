import { Platform } from "react-native";

/** En nativo la tab bar flota; en web/PWA va en el flujo para no tapar botones. */
export const TAB_BAR_OVERLAYS_SCENE = Platform.OS !== "web";

/** Hueco inferior de listas cuando la tab bar cubre el contenido (nativo). */
export const SCENE_TAB_CLEARANCE = TAB_BAR_OVERLAYS_SCENE ? 120 : 32;

export function stickyControlReserve(insetsBottom: number): number {
  if (!TAB_BAR_OVERLAYS_SCENE) return 8;
  return 62 + Math.max(insetsBottom, 10);
}

export function tabBarBottomPad(insetsBottom: number): number {
  if (Platform.OS === "web") return Math.max(insetsBottom, 24);
  return Math.max(insetsBottom, 10);
}
