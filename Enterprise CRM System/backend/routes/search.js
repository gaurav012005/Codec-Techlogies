const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const searchController = require('../controllers/searchController');

router.use(auth);
router.use(tenantMiddleware);

router.get('/', searchController.globalSearch);

module.exports = router;
