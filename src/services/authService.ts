/**
 * Autenticación híbrida: Modo Invitado (solo local) vs Modo Nube (Supabase + blobs cifrados).
 * El ID clínico (anonymous_id) está disociado del email en tablas de salud.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient, Session, User as SupabaseUser } from "@supabase/supabase-js";
import * as Crypto from "expo-crypto";

import type { AuthMode, UserProfile, UserGoal } from "../types/user";
import { applyOnboarding, createGuestProfile } from "../utils/authProfile";
import { encryptJson, hashEmail } from "./cryptoService";
import { sincronizarDatosLocalesAlServidor } from "./cloudSyncService";

export { createGuestProfile } from "../utils/authProfile";

const STORAGE_PROFILE = "lunera:profile";
const STORAGE_ANON_ID = "lunera_anonymous_id_v1";

export type AuthState =
  | { status: "loading" }
  | { status: "guest"; profile: UserProfile }
  | { status: "authenticated"; profile: UserProfile; session: Session }
  | { status: "signed_out" };

export interface AuthServiceConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

let supabase: SupabaseClient | null = null;

export function initSupabase(config: AuthServiceConfig): SupabaseClient {
  if (!supabase) {
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return supabase;
}

export function getSupabase(): SupabaseClient {
  if (!supabase) throw new Error("Supabase not initialized. Call initSupabase first.");
  return supabase;
}

async function generateId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getOrCreateAnonymousId(): Promise<string> {
  const existing = await AsyncStorage.getItem(STORAGE_ANON_ID);
  if (existing) return existing;
  const id = `anon_${await generateId()}`;
  await AsyncStorage.setItem(STORAGE_ANON_ID, id);
  return id;
}

export async function loadStoredProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_PROFILE);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

async function persistProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_PROFILE, JSON.stringify(profile));
}

/** Modo Invitado Absoluto — datos solo en dispositivo */
export async function signInAsGuest(): Promise<UserProfile> {
  const id = await getOrCreateAnonymousId();
  const profile = createGuestProfile({ id, authMode: "guest", onboardingCompleted: false });
  await persistProfile(profile);
  return profile;
}

export async function completeOnboarding(input: {
  lastPeriodStart: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  goals: UserGoal[];
}): Promise<UserProfile> {
  const current = (await loadStoredProfile()) ?? (await signInAsGuest());
  const updated: UserProfile = {
    ...current,
    ...input,
    onboardingCompleted: true,
    updatedAt: new Date().toISOString(),
  };
  await persistProfile(updated);
  return updated;
}

export async function signUpWithEmail(email: string, password: string): Promise<UserProfile> {
  const client = getSupabase();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return linkCloudProfile(data.user!, email);
}

export async function signInWithEmail(email: string, password: string): Promise<UserProfile> {
  const client = getSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return linkCloudProfile(data.user!, email);
}

export async function signInWithOAuth(provider: "google" | "apple"): Promise<void> {
  const client = getSupabase();
  const { error } = await client.auth.signInWithOAuth({ provider });
  if (error) throw error;
}

async function linkCloudProfile(user: SupabaseUser, email?: string): Promise<UserProfile> {
  const local = (await loadStoredProfile()) ?? createGuestProfile();
  const anonymousId = await getOrCreateAnonymousId();
  const emailHash = email ? await hashEmail(email) : undefined;

  const profile: UserProfile = {
    ...local,
    id: anonymousId,
    authMode: "cloud",
    supabaseUid: user.id,
    emailHash,
    updatedAt: new Date().toISOString(),
  };

  await persistProfile(profile);
  await registerAnonymousProfile(profile);
  await sincronizarDatosLocalesAlServidor(profile).catch(() => {});
  return profile;
}

/** Registra perfil anonimizado en Supabase — sin síntomas en claro */
async function registerAnonymousProfile(profile: UserProfile): Promise<void> {
  if (!profile.supabaseUid) return;
  const client = getSupabase();
  const { error } = await client.from("anonymous_profiles").upsert({
    id: profile.id,
    supabase_uid: profile.supabaseUid,
    email_hash: profile.emailHash ?? null,
  });
  if (error) throw error;
}

/** Sube vault cifrado; el servidor solo almacena ciphertext */
export async function syncEncryptedHealthVault(payload: {
  cycles: unknown[];
  logs: unknown[];
  config: unknown;
}): Promise<void> {
  const profile = await loadStoredProfile();
  if (!profile || profile.authMode !== "cloud") return;

  const { ciphertext, iv } = await encryptJson(payload);
  const client = getSupabase();
  const { error } = await client.from("encrypted_health_blobs").upsert({
    anonymous_id: profile.id,
    ciphertext,
    iv,
    version: 1,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const client = getSupabase();
  await client.auth.signOut();
  await AsyncStorage.removeItem(STORAGE_PROFILE);
}

export async function restoreSession(): Promise<AuthState> {
  const stored = await loadStoredProfile();
  if (!stored) return { status: "signed_out" };

  if (stored.authMode === "guest") {
    return { status: "guest", profile: stored };
  }

  const client = getSupabase();
  const { data } = await client.auth.getSession();
  if (!data.session) {
    return { status: "guest", profile: { ...stored, authMode: "guest" } };
  }

  return { status: "authenticated", profile: stored, session: data.session };
}

export function onAuthStateChange(callback: (state: AuthState) => void): () => void {
  const client = getSupabase();
  const { data } = client.auth.onAuthStateChange(async (_event, session) => {
    if (!session) {
      const guest = await loadStoredProfile();
      callback(guest ? { status: "guest", profile: guest } : { status: "signed_out" });
      return;
    }
    const profile = await loadStoredProfile();
    if (profile) callback({ status: "authenticated", profile, session });
  });
  return () => data.subscription.unsubscribe();
}
