const express = require('express');
const { getPipeline, moveCandidate } = require('../controllers/pipelineController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/:jobId', getPipeline);
router.put('/move', moveCandidate);

module.exports = router;
