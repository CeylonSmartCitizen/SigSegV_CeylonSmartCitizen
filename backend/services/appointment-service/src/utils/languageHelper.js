// src/utils/languageHelper.js
// Utility to select preferred language fields from a multilingual object

const SUPPORTED_LANGS = ['en', 'si', 'ta'];

function getPreferredLanguage(req) {
  // 1. Check query param
  if (req.query.language && SUPPORTED_LANGS.includes(req.query.language)) {
    return req.query.language;
  }
  // 2. Check Accept-Language header
  const accept = req.headers['accept-language'];
  if (accept) {
    const langs = accept.split(',').map(l => l.trim().split(';')[0]);
    for (const lang of langs) {
      if (SUPPORTED_LANGS.includes(lang)) return lang;
    }
  }
  // 3. Fallback
  return 'en';
}

function pickLang(obj, lang, fields) {
  // fields: [{ base: 'name', si: 'name_si', ta: 'name_ta' }, ...]
  const result = {};
  for (const f of fields) {
    if (lang === 'si' && obj[f.si]) result[f.base] = obj[f.si];
    else if (lang === 'ta' && obj[f.ta]) result[f.base] = obj[f.ta];
    else result[f.base] = obj[f.base];
  }
  return result;
}

module.exports = { getPreferredLanguage, pickLang };
