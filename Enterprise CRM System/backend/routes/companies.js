const express = require('express');
const router = express.Router();
const cc = require('../controllers/companyController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');

router.use(authMiddleware, tenantMiddleware);

router.get('/', roleMiddleware('companies:read'), cc.getCompanies);
router.get('/:id', roleMiddleware('companies:read'), cc.getCompany);
router.post('/', roleMiddleware('companies:write'), cc.createCompany);
router.put('/:id', roleMiddleware('companies:write'), cc.updateCompany);
router.delete('/:id', roleMiddleware('companies:write'), cc.deleteCompany);

module.exports = router;
