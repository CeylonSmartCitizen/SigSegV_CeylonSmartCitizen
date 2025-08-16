
const Tesseract = require('tesseract.js');
const path = require('path');

// Path to custom traineddata files
const langPath = path.join(__dirname, '../../config/language');

async function extractText(filePath, lang = 'sin+eng') {
  const result = await Tesseract.recognize(filePath, lang, {
    langPath: langPath,
  });
  return {
    text: result.data.text,
    confidence: result.data.confidence,
    blocks: result.data.blocks,
  };
}

module.exports = { extractText };
