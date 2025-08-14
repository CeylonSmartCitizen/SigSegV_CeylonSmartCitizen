// src/utils/tokenGenerator.js
// Generates unique appointment token numbers

function generateToken(serviceCode, date, sequence) {
  // Format: APT-{service_code}-{DDMMYY}-{sequence}
  const ddmmyy = date.toISOString().slice(0, 10).split('-').reverse().join('').slice(0, 6);
  const seq = String(sequence).padStart(3, '0');
  return `APT-${serviceCode}-${ddmmyy}-${seq}`;
}

module.exports = { generateToken };
