const express = require('express');
const { addCard, getCards, getCardById } = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add', authMiddleware, addCard);
router.get('/', getCards);
router.get('/:id', authMiddleware, getCardById);

module.exports = router;