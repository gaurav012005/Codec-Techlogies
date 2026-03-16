const express = require('express');
const { body } = require('express-validator');
const { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate } = require('../controllers/candidateController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', getCandidates);
router.get('/:id', getCandidate);
router.post('/', [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
], createCandidate);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

module.exports = router;
