/**
 * Sincronización híbrida invitado → nube.
 * Sube logs, ciclos y config locales al vault cifrado de Supabase tras el primer login.
 */

import type { UserProfile } from "../types/user";
import { loadConfig, loadCycles, loadLogs, saveConfig } from "./localStorage";
import { syncEncryptedHealthVault } from "./authService";

export interface SyncResult {
  synced: boolean;
  logsCount: number;
  cyclesCount: number;
  syncedAt: string;
  mode: "cloud_vault" | "local_prepared" | "skipped";
}

export async function sincronizarDatosLocalesAlServidor(profile: UserProfile): Promise<SyncResult> {
  const [logs, allCycles, config] = await Promise.all([
    loadLogs(),
    loadCycles(),
    loadConfig(profile.id),
  ]);

  const userLogs = logs.filter((l) => l.userId === profile.id);
  const userCycles = allCycles.filter((c) => c.userId === profile.id);
  const payload = { cycles: userCycles, logs: userLogs, config };
  const syncedAt = new Date().toISOString();

  if (profile.authMode !== "cloud") {
    return {
      synced: false,
      logsCount: userLogs.length,
      cyclesCount: userCycles.length,
      syncedAt,
      mode: "skipped",
    };
  }

  let mode: SyncResult["mode"] = "local_prepared";

  if (profile.supabaseUid) {
    await syncEncryptedHealthVault(payload);
    mode = "cloud_vault";
  }

  await saveConfig({
    ...config,
    userId: profile.id,
    syncEnabled: true,
    lastBackupAt: syncedAt,
    cloudSyncedAt: syncedAt,
  });

  return {
    synced: true,
    logsCount: userLogs.length,
    cyclesCount: userCycles.length,
    syncedAt,
    mode,
  };
}
