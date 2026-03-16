const pool = require('./config/db');

async function run() {
    try {
        await pool.query('ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS signature_image_url VARCHAR(500);');
        console.log('Column added successfully');
    } catch (err) {
        console.error('Error adding column', err);
    } finally {
        process.exit();
    }
}

run();
