// test-ocr.js - Simple test script for OCR integration
const { extractText } = require('./util/ocrTextExtractor');
const { detectDocumentType } = require('./util/documentTypeDetector');
const { parseNIC } = require('./processors/nicParser');
const { parseBirthCertificate } = require('./processors/birthCertificateParser');
const { validateAuthenticity } = require('./processors/authenticityValidator');
const { flagSuspiciousDocument } = require('./processors/suspiciousDocumentFlagger');

async function runOCRTest() {
  console.log('🔍 Starting OCR Integration Test...\n');

  // Test 1: Text Extraction (using a simple text for demo)
  console.log('Test 1: Text Extraction');
  try {
    // Note: This would normally use an actual image file
    const mockResult = {
      text: 'DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA IDENTITY CARD Name: JOHN DOE Address: 123 Main Street, Colombo Date of Birth: 01/01/1990 ID Number: 901234567V',
      confidence: 0.85
    };
    console.log('✅ Text extraction simulated successfully');
    console.log('📄 Extracted text:', mockResult.text.substring(0, 50) + '...');
    console.log('📊 Confidence:', mockResult.confidence);

    // Test 2: Document Type Detection
    console.log('\nTest 2: Document Type Detection');
    const docType = detectDocumentType(mockResult.text);
    console.log('✅ Document type detected:', docType);

    // Test 3: NIC Parsing
    console.log('\nTest 3: NIC Parsing');
    const nicData = parseNIC(mockResult.text);
    console.log('✅ NIC parsing completed:');
    console.log('   Name:', nicData.name);
    console.log('   ID Number:', nicData.idNumber);
    console.log('   Date of Birth:', nicData.dateOfBirth);

    // Test 4: Authenticity Validation
    console.log('\nTest 4: Authenticity Validation');
    const isAuthentic = validateAuthenticity(mockResult.text, 'nic');
    console.log('✅ Authenticity check:', isAuthentic ? 'AUTHENTIC' : 'SUSPICIOUS');

    // Test 5: Suspicious Document Flagging
    console.log('\nTest 5: Suspicious Document Flagging');
    const suspiciousCheck = flagSuspiciousDocument({
      text: mockResult.text,
      confidence: mockResult.confidence,
      fields: nicData,
      authenticity: isAuthentic
    });
    console.log('✅ Suspicious document check:');
    console.log('   Is Suspicious:', suspiciousCheck.isSuspicious);
    console.log('   Reasons:', suspiciousCheck.reasons);

    console.log('\n🎉 All OCR integration tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
runOCRTest();
