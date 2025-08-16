// Simple birth certificate parser for Sri Lankan documents
function parseBirthCertificate(text) {
  // Normalize text
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = {};

  // Child's name
  const nameLine = lines.find(l => /^(name of child|child name|name)[:\s]/i.test(l));
  if (nameLine) result.child_name = nameLine.replace(/^(name of child|child name|name)[:\s]*/i, '');

  // Date of birth
  const dobMatch = text.match(/(19|20)[0-9]{2}[- \/.][0-9]{2}[- \/.][0-9]{2}/);
  if (dobMatch) result.date_of_birth = dobMatch[0];

  // Place of birth
  const placeLine = lines.find(l => /^(place of birth|birth place)[:\s]/i.test(l));
  if (placeLine) result.place_of_birth = placeLine.replace(/^(place of birth|birth place)[:\s]*/i, '');

  // Father's name
  const fatherLine = lines.find(l => /^(father|father's name|name of father)[:\s]/i.test(l));
  if (fatherLine) result.father_name = fatherLine.replace(/^(father|father's name|name of father)[:\s]*/i, '');

  // Mother's name
  const motherLine = lines.find(l => /^(mother|mother's name|name of mother)[:\s]/i.test(l));
  if (motherLine) result.mother_name = motherLine.replace(/^(mother|mother's name|name of mother)[:\s]*/i, '');

  // Registration number
  const regMatch = text.match(/registration number[:\s]*([A-Za-z0-9\/-]+)/i);
  if (regMatch) result.registration_number = regMatch[1];

  // Sex
  const sexMatch = text.match(/\b(male|female)\b/i);
  if (sexMatch) result.sex = sexMatch[1];

  // Add more fields as needed

  return result;
}

module.exports = { parseBirthCertificate };
