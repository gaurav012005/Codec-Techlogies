const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Multer setup for POD image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `pod_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// GET /api/deliveries/:id - Get single delivery with full details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT d.*, u.name as driver_name, u.email as driver_email, v.vehicle_number
            FROM deliveries d
            LEFT JOIN users u ON d.driver_id = u.id
            LEFT JOIN vehicles v ON d.vehicle_id = v.id
            WHERE d.id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get delivery error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/deliveries/:id/pod - Upload proof of delivery image
router.post('/:id/pod', authenticateToken, upload.single('proof_image'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

        const imageUrl = `/uploads/${req.file.filename}`;
        const result = await pool.query(
            'UPDATE deliveries SET proof_image_url = $1 WHERE id = $2 RETURNING *',
            [imageUrl, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });
        res.json({ message: 'POD uploaded successfully', delivery: result.rows[0] });
    } catch (error) {
        console.error('POD upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/deliveries/:id/signature - Upload signature image
router.post('/:id/signature', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { signature } = req.body;

        if (!signature) return res.status(400).json({ error: 'No signature provided' });

        // signature is a base64 string, store it directly or save to file
        // For simplicity and to avoid file system issues with base64, we can save a data URL 
        // to the DB or save it as a file. Saving as a file is cleaner.
        const base64Data = signature.replace(/^data:image\/png;base64,/, "");
        const filename = `sig_${id}_${Date.now()}.png`;
        const fs = require('fs');
        const filepath = path.join(__dirname, '..', 'uploads', filename);

        fs.writeFileSync(filepath, base64Data, 'base64');
        const imageUrl = `/uploads/${filename}`;

        const result = await pool.query(
            'UPDATE deliveries SET signature_image_url = $1 WHERE id = $2 RETURNING *',
            [imageUrl, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });

        // Broadcast the update to admins
        const io = require('../server').io;
        if (io) {
            io.emit('delivery:updated', { deliveryId: id });
        }

        res.json({ message: 'Signature saved successfully', delivery: result.rows[0] });
    } catch (error) {
        console.error('Signature upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
