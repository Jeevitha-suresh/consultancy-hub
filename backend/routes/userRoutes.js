const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(protect, getUsers);
router.route('/profile').put(protect, upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), updateUserProfile);
router.route('/:id').get(protect, getUserProfile);

module.exports = router;
