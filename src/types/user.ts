/** Perfil local / nube disociado del email real */

export type AuthMode = "guest" | "cloud";

export type UserGoal = "track_cycle" | "try_pregnancy" | "learn_body";
export type AgeBand = "under_20" | "20_29" | "30_39" | "40_49" | "50_plus";
export type KnownCondition = "pcos" | "endometriosis" | "fibroids" | "adenomyosis" | "thyroid_disorder";

export interface UserProfile {
  /** UUID local o anónimo en nube — nunca el email */
  id: string;
  authMode: AuthMode;
  /** Solo presente en modo cloud; referencia opaca a Supabase Auth */
  supabaseUid?: string;
  /** Hash one-way del email en cloud (opcional, para deduplicar sin almacenar email) */
  emailHash?: string;
  displayName?: string;
  goals: UserGoal[];
  ageBand?: AgeBand | null;
  knownConditions?: KnownCondition[];
  /** ISO date YYYY-MM-DD */
  lastPeriodStart: string | null;
  averageCycleLength: number;
  averagePeriodLength: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnonymousProfileRow {
  id: string;
  supabase_uid: string;
  email_hash: string | null;
  created_at: string;
}

/** Payload cifrado antes de subir — el servidor no puede leer síntomas */
export interface EncryptedHealthBlob {
  anonymous_id: string;
  ciphertext: string;
  iv: string;
  version: number;
  updated_at: string;
}
