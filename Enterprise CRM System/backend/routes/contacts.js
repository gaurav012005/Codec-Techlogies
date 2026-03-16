const express = require('express');
const router = express.Router();
const cc = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { roleMiddleware } = require('../middleware/role');

router.use(authMiddleware, tenantMiddleware);

router.get('/', roleMiddleware('contacts:read'), cc.getContacts);
router.get('/:id', roleMiddleware('contacts:read'), cc.getContact);
router.post('/', roleMiddleware('contacts:write'), cc.createContact);
router.put('/:id', roleMiddleware('contacts:write'), cc.updateContact);
router.delete('/:id', roleMiddleware('contacts:write'), cc.deleteContact);

module.exports = router;
