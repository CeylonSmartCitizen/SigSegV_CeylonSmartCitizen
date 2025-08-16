// Document authenticity validator for Sri Lankan government documents

const AUTH_MARKERS = [
  'official seal',
  'signature',
  'watermark',
  'government of sri lanka',
  'ministry of',
  'registration number',
  'issued by',
  'valid until',
  'certified copy',
  'department of',
  'authorized officer',
  'stamp',
  'original',
  'notary',
  'embossed',
  'barcode',
  'qr code'
];

function validateAuthenticity(text) {
  const lowerText = text.toLowerCase();
  const foundMarkers = AUTH_MARKERS.filter(marker => lowerText.includes(marker));
  const score = foundMarkers.length / AUTH_MARKERS.length; // 0.0 to 1.0

  return {
    isAuthentic: foundMarkers.length >= 2, // threshold can be adjusted
    score,
    foundMarkers
  };
}

module.exports = { validateAuthenticity };
