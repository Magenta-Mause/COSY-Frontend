import "i18next";
import type { i18nLanguage } from "@/i18n/i18nKeys.ts";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: i18nLanguage };
  }
}
