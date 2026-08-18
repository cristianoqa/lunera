import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile } from "../types/user";

const CREDS_KEY = "lunera_local_creds_v1";
const PROFILE_KEY = "lunera:profile";
const ONBOARDING_KEY = "lunera:onboarding_done";

export interface LocalCredentials {
  email: string;
  passwordHash: string;
  userId: string;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export async function getStoredCredentials(): Promise<LocalCredentials | null> {
  const raw = await SecureStore.getItemAsync(CREDS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalCredentials;
  } catch {
    return null;
  }
}

export async function registerLocalAccount(input: {
  email: string;
  password: string;
  profile: UserProfile;
}): Promise<UserProfile> {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@") || input.password.length < 6) {
    throw new Error("invalid_credentials");
  }
  const existing = await getStoredCredentials();
  if (existing && existing.email === email) {
    throw new Error("email_taken");
  }

  const userId = input.profile.id.startsWith("guest_")
    ? `user_${Date.now()}`
    : input.profile.id;
  const passwordHash = await hashPassword(input.password, userId);
  const creds: LocalCredentials = { email, passwordHash, userId };
  await SecureStore.setItemAsync(
    CREDS_KEY,
    JSON.stringify(creds),
    Platform.OS === "web" ? undefined : { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
  );

  const emailHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, email);
  const upgraded: UserProfile = {
    ...input.profile,
    id: userId,
    authMode: "cloud",
    emailHash,
    displayName: input.profile.displayName ?? email.split("@")[0],
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(upgraded));
  return upgraded;
}

export async function loginLocalAccount(email: string, password: string): Promise<UserProfile> {
  const creds = await getStoredCredentials();
  if (!creds) throw new Error("no_account");
  if (creds.email !== email.trim().toLowerCase()) throw new Error("wrong_email");
  const hash = await hashPassword(password, creds.userId);
  if (hash !== creds.passwordHash) throw new Error("wrong_password");

  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) throw new Error("no_profile");
  const profile = JSON.parse(raw) as UserProfile;
  const next: UserProfile = {
    ...profile,
    id: creds.userId,
    authMode: "cloud",
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
}

/** Cierra sesión: vuelve a modo invitado conservando datos locales de salud */
export async function logoutToGuest(profile: UserProfile): Promise<UserProfile> {
  const guest: UserProfile = {
    ...profile,
    authMode: "guest",
    emailHash: undefined,
    supabaseUid: undefined,
    displayName: undefined,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(guest));
  return guest;
}

export async function clearSessionFlags(): Promise<void> {
  // No borramos logs/config; solo flags de sesión si hace falta
  await AsyncStorage.setItem(ONBOARDING_KEY, "1");
}
