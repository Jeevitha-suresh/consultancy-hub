const express = require('express');
const router = express.Router();
const { getMessages, getConversations, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, sendMessage);
router.route('/conversations').get(protect, getConversations);
router.route('/:userId').get(protect, getMessages);
router.route('/:userId/:otherUserId').get(protect, getMessages);

module.exports = router;
