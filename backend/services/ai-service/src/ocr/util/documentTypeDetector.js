// Document type detection utility
// Detects NIC, birth certificate, and other document types based on extracted text

const NIC_KEYWORDS = [
  'national identity card', 'nic', 'identity card', 'id number', 'date of birth', 'address', 'nic no', 'nic number', 'sri lanka', 'name', 'sex', 'male', 'female'
];

const BIRTH_CERT_KEYWORDS = [
  'birth certificate', 'certificate of birth', 'place of birth', 'date of birth', 'father', 'mother', 'registration number', 'district', 'division', 'name of child', 'sex', 'male', 'female'
];

function detectDocumentType(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  let type = 'unknown';

  // NIC detection
  const nicHits = NIC_KEYWORDS.filter(keyword => lowerText.includes(keyword)).length;
  if (nicHits >= 3) {
    score = nicHits;
    type = 'NIC';
  }

  // Birth certificate detection
  const birthCertHits = BIRTH_CERT_KEYWORDS.filter(keyword => lowerText.includes(keyword)).length;
  if (birthCertHits >= 3 && birthCertHits > score) {
    score = birthCertHits;
    type = 'BirthCertificate';
  }

  // Add more document types here as needed

  return {
    type,
    score,
    details: {
      nicHits,
      birthCertHits
    }
  };
}

module.exports = { detectDocumentType };
