const express = require('express');
const router = express.Router();
const { prisma } = require('../app');

// Create document entry
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const doc = await prisma.document.create({ data });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// List all documents
router.get('/', async (req, res) => {
  try {
    const docs = await prisma.document.findMany();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get a single document
router.get('/:id', async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
    });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update verification status
router.patch('/:id/verify', async (req, res) => {
  try {
    const { verified_by, verification_status } = req.body;
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: { verified_by, verification_status, verified_at: new Date() },
    });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

module.exports = router;
