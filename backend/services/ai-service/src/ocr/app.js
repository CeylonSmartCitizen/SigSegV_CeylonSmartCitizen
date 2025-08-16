// Entry point for OCR service API
const express = require('express');
const path = require('path');
const { extractText } = require('./util/ocrTextExtractor');

const app = express();
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// OCR endpoint
app.post('/ocr', async (req, res) => {
  try {
    // Expecting { filePath, lang } in body
    const { filePath, lang } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }
    const result = await extractText(filePath, lang || 'sin+eng');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OCR service running on port ${PORT}`);
});
