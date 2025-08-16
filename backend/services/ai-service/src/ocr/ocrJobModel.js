// Structure for an OCR job
class OCRJob {
  constructor({ filePath, lang = 'sin+eng', type = 'generic', meta = {} }) {
    this.filePath = filePath;
    this.lang = lang;
    this.type = type; // e.g., 'NIC', 'certificate', etc.
    this.meta = meta; // any extra info
    this.status = 'pending';
    this.result = null;
    this.createdAt = new Date();
  }
}

module.exports = OCRJob;
