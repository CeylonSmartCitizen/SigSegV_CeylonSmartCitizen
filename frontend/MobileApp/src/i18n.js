import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en/translation.json';
import si from './locales/si/translation.json';
import ta from './locales/ta/translation.json';

// Detect language from device, fallback to English
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (cb) => cb(Localization.locale.split('-')[0]),
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
