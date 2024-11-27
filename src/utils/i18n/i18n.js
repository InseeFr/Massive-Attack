import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import frTranslation from './fr.json';
import enTranslation from './en.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
};

const i18nInstance = i18n;

i18nInstance
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18nInstance;
