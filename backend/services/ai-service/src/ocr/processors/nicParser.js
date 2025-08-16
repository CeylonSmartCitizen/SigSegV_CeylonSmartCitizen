// Simple NIC parser for Sri Lankan NIC documents
function parseNIC(text) {
  // Normalize text
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = {};

  // NIC number (12 digits or old format)
  const nicMatch = text.match(/([0-9]{9}[vVxX]|[0-9]{12})/);
  if (nicMatch) result.nic_number = nicMatch[1];

  // Name (look for lines starting with 'Name' or similar)
  const nameLine = lines.find(l => /^name[:\s]/i.test(l));
  if (nameLine) result.name = nameLine.replace(/^name[:\s]*/i, '');

  // Address (look for lines starting with 'Address')
  const addressLine = lines.find(l => /^address[:\s]/i.test(l));
  if (addressLine) result.address = addressLine.replace(/^address[:\s]*/i, '');

  // Date of Birth (look for date patterns)
  const dobMatch = text.match(/(19|20)[0-9]{2}[- \/.][0-9]{2}[- \/.][0-9]{2}/);
  if (dobMatch) result.date_of_birth = dobMatch[0];

  // Gender (look for 'Male' or 'Female')
  const genderMatch = text.match(/\b(male|female)\b/i);
  if (genderMatch) result.gender = genderMatch[1];

  // Add more fields as needed

  return result;
}

module.exports = { parseNIC };
