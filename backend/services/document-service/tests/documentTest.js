const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/documents';

async function runTests() {
  try {
    // 1. Upload a document (multipart/form-data)
    const form = new FormData();
    form.append('user_id', '00000000-0000-0000-0000-000000000001');
    form.append('document_type', 'nic');
    form.append('file', fs.createReadStream('./tests/sample.pdf'));
    const uploadRes = await axios.post(`${BASE_URL}/upload`, form, {
      headers: form.getHeaders()
    });
    console.log('Upload Document:', uploadRes.data);

    const docId = uploadRes.data.documentId || uploadRes.data.document.id;

    // 2. List user's documents
    const listRes = await axios.get(`${BASE_URL}?user_id=00000000-0000-0000-0000-000000000001`);
    console.log('List Documents:', listRes.data);

    // 3. Get document by ID
    const getRes = await axios.get(`${BASE_URL}/${docId}`);
    console.log('Get Document:', getRes.data);

    // 4. Update verification status
    const verifyRes = await axios.put(`${BASE_URL}/${docId}/status`, {
      verified_by: '00000000-0000-0000-0000-000000000002',
      verification_status: 'verified'
    });
    console.log('Verify Document:', verifyRes.data);

    // 5. Download document
    // (Assumes authentication, may need token in headers)
    // const downloadRes = await axios.get(`${BASE_URL}/${docId}/download`, { responseType: 'stream' });
    // downloadRes.data.pipe(fs.createWriteStream('./tests/downloaded.pdf'));
    // console.log('Downloaded Document');

    // 6. Expire document
    const expireRes = await axios.patch(`${BASE_URL}/${docId}/expire`);
    console.log('Expire Document:', expireRes.data);

    // 7. Delete document
    const deleteRes = await axios.delete(`${BASE_URL}/${docId}`);
    console.log('Delete Document:', deleteRes.data);

  } catch (err) {
    console.error('Test Failed:', err.response?.data || err.message);
  }
}

runTests();
