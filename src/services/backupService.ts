import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { encryptJson, decryptJson } from "./cryptoService";
import { exportAllData, importAllData } from "./localStorage";

export async function exportEncryptedBackup(): Promise<string> {
  const data = await exportAllData();
  const { ciphertext, iv } = await encryptJson(data);
  const envelope = { version: 1, exportedAt: new Date().toISOString(), ciphertext, iv, salt: "" };
  const dir = `${FileSystem.documentDirectory}backups/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const path = `${dir}lunera-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(envelope));
  return path;
}

export async function shareBackup(path: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: "application/json", dialogTitle: "Lunera backup" });
  }
}

export async function importEncryptedBackup(): Promise<boolean> {
  const pick = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
  if (pick.canceled || !pick.assets?.[0]?.uri) return false;
  const raw = await FileSystem.readAsStringAsync(pick.assets[0].uri);
  const envelope = JSON.parse(raw) as { ciphertext: string; iv: string };
  const data = await decryptJson<Awaited<ReturnType<typeof exportAllData>>>(envelope.ciphertext, envelope.iv);
  await importAllData(data);
  return true;
}
