export type ClinicalAlertSeverity = "info" | "warning" | "urgent";
export type ClinicalAlertCode =
  | "long_cycle_pattern"
  | "short_cycle_pattern"
  | "cycle_variability_high"
  | "amenorrhea_possible"
  | "repeated_spotting"
  | "heavy_bleeding_pattern"
  | "pregnancy_warning_signs"
  | "reduced_fetal_movement"
  | "elevated_blood_pressure"
  | "menopause_burden_high";

export interface ClinicalAlert {
  code: ClinicalAlertCode;
  severity: ClinicalAlertSeverity;
  titleKey: string;
  bodyKey: string;
  relatedDates?: string[];
  metadata?: Record<string, string | number | boolean | null>;
}
