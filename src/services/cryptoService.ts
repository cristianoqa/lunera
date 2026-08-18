/**
 * Cifrado del lado del cliente (AES-256-GCM via Web Crypto API en Expo).
 * Los síntomas nunca salen en claro hacia Supabase.
 */

import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEK_KEY = "lunera_data_encryption_key_v1";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

async function importAesKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", toArrayBuffer(rawKey), { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function getOrCreateDataKey(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(DEK_KEY);
  if (existing) return base64ToBytes(existing);

  const raw = await Crypto.getRandomBytesAsync(32);
  const options =
    Platform.OS === "web"
      ? undefined
      : { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
  await SecureStore.setItemAsync(DEK_KEY, bytesToBase64(raw), options);
  return raw;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
}

export async function encryptJson(payload: unknown): Promise<EncryptedPayload> {
  const keyBytes = await getOrCreateDataKey();
  const key = await importAesKey(keyBytes);
  const iv = await Crypto.getRandomBytesAsync(12);
  const encoded = new TextEncoder().encode(JSON.stringify(payload));

  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, encoded);

  return {
    ciphertext: bytesToBase64(new Uint8Array(cipherBuffer)),
    iv: bytesToBase64(iv),
  };
}

export async function decryptJson<T>(ciphertext: string, ivB64: string): Promise<T> {
  const keyBytes = await getOrCreateDataKey();
  const key = await importAesKey(keyBytes);
  const iv = base64ToBytes(ivB64);
  const data = base64ToBytes(ciphertext);

  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(data));
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}

export async function hashEmail(email: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, email.trim().toLowerCase());
}
