const axios = require('axios');

const BASE_URL = 'http://localhost:3000/documents';

async function runTests() {
  try {
    // 1. Create a document
    const createRes = await axios.post(BASE_URL, {
      user_id: "00000000-0000-0000-0000-000000000001",
      document_type: "nic",
      file_path: "/path/to/nic.pdf"
    });
    console.log('Create Document:', createRes.data);

    const docId = createRes.data.id;

    // 2. List documents
    const listRes = await axios.get(BASE_URL);
    console.log('List Documents:', listRes.data);

    // 3. Get document by ID
    const getRes = await axios.get(`${BASE_URL}/${docId}`);
    console.log('Get Document:', getRes.data);

    // 4. Update verification
    const verifyRes = await axios.patch(`${BASE_URL}/${docId}/verify`, {
      verified_by: "00000000-0000-0000-0000-000000000002",
      verification_status: "verified"
    });
    console.log('Verify Document:', verifyRes.data);

  } catch (err) {
    console.error('Test Failed:', err.response?.data || err.message);
  }
}

runTests();
