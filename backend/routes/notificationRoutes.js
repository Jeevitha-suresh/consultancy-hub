const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, getUnreadCount } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications);
router.route('/read').put(protect, markAllRead);
router.route('/count').get(protect, getUnreadCount);

module.exports = router;
