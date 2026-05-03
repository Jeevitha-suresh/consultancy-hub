const express = require('express');
const router = express.Router();
const { sendRequest, acceptRequest, rejectRequest, getConnections } = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getConnections);
router.route('/request/:id').post(protect, sendRequest);
router.route('/accept/:id').post(protect, acceptRequest);
router.route('/reject/:id').post(protect, rejectRequest);

module.exports = router;
