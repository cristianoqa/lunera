import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import type { DailyLog } from "../types/dailyLog";
import type { UserProfile } from "../types/user";
import type { CyclePrediction } from "../types/cycle";
import type { ClinicalAlert } from "../types/clinical";
import i18n from "../i18n";
import { buildMedicalReportHtml } from "./pdfReportHtml";

export { buildMedicalReportHtml } from "./pdfReportHtml";

function t(key: string, lng: string): string {
  return i18n.t(key, { lng });
}

type PdfInput = {
  profile: UserProfile;
  prediction: CyclePrediction | null;
  logs: DailyLog[];
  locale?: string;
  clinicalAlerts?: ClinicalAlert[];
};

async function createPdfFile(input: PdfInput): Promise<{ uri: string; lng: string }> {
  const lng = (input.locale ?? i18n.language ?? "es").slice(0, 2);
  const html = buildMedicalReportHtml(input);
  const { uri } = await Print.printToFileAsync({ html });
  return { uri, lng };
}

/** Guarda en Descargas (Android SAF) o abre share para que la usuaria elija carpeta */
export async function saveMedicalPdf(
  input: PdfInput
): Promise<{ uri: string; message: string; savedToDownloads: boolean }> {
  const { uri, lng } = await createPdfFile(input);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `lunera-informe-${stamp}.pdf`;

  if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
    try {
      const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (perms.granted) {
        const dest = await FileSystem.StorageAccessFramework.createFileAsync(
          perms.directoryUri,
          filename,
          "application/pdf"
        );
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(dest, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return {
          uri: dest,
          message: t("pdf_saved_downloads", lng),
          savedToDownloads: true,
        };
      }
    } catch {
      /* fallback share */
    }
  }

  // iOS / si cancela SAF: compartir para Guardar en Archivos / Descargas
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: t("pdf_save_as_title", lng),
      UTI: "com.adobe.pdf",
    });
    return { uri, message: t("pdf_saved_share_hint", lng), savedToDownloads: false };
  }

  const cache = `${FileSystem.cacheDirectory ?? ""}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: cache });
  return { uri: cache, message: t("pdf_saved_body", lng), savedToDownloads: false };
}

export async function shareMedicalPdf(input: PdfInput): Promise<string> {
  const { uri, lng } = await createPdfFile(input);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: t("pdf_share_title", lng),
      UTI: "com.adobe.pdf",
    });
  }
  return uri;
}

export type PdfExportAction = "save" | "share" | "both" | "cancel";

export async function runMedicalPdfAction(action: PdfExportAction, input: PdfInput): Promise<string> {
  if (action === "cancel") return "";
  if (action === "save") return (await saveMedicalPdf(input)).uri;
  if (action === "share") return shareMedicalPdf(input);
  const saved = await saveMedicalPdf(input);
  await shareMedicalPdf(input);
  return saved.uri;
}

export async function exportMedicalPdf(
  input: PdfInput,
  chooseAction?: () => Promise<PdfExportAction>
): Promise<string> {
  const action = chooseAction ? await chooseAction() : "share";
  return runMedicalPdfAction(action, input);
}
