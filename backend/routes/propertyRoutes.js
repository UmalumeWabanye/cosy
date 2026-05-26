const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const {
  getMyProperties,
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, landlordOnly } = require('../middleware/auth');

// multer — memory storage so we can pass buffer to Cloudinary
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Student-facing property browsing must remain public.
router.get('/mine', protect, landlordOnly, getMyProperties);
router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', protect, landlordOnly, createProperty);
router.put('/:id', protect, landlordOnly, updateProperty);
router.delete('/:id', protect, landlordOnly, deleteProperty);

// POST /api/properties/:id/upload-image — upload a single image to Cloudinary
router.post('/:id/upload-image', protect, landlordOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    // Upload buffer to Cloudinary as a data stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'cosy/properties', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });

    res.json({ imageUrl: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ message: err.message || 'Image upload failed' });
  }
});

module.exports = router;
