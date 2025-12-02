import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import i18nDE from "./de-DE/translation";
import i18nEN from "./en-US/translation";

const resources = {
  en: {
    translation: i18nEN,
  },
  de: {
    translation: i18nDE,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources,
  });
