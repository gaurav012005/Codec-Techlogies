const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');
const ic = require('../controllers/importExportController');

router.use(auth);
router.use(tenantMiddleware);

// Import
router.post('/import/:entity', roleMiddleware('import:write'), ic.importData);
router.post('/import/preview', ic.previewImport);
router.get('/import/history', ic.getImportHistory);

// Export
router.get('/export/:entity', roleMiddleware('export:read'), ic.exportData);

module.exports = router;
