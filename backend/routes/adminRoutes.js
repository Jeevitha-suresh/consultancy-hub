const express = require('express');
const router = express.Router();
const {
  getUsers,
  deleteUser,
  deletePost,
  createRecruiter,
  getRecruiters,
  resetRecruiterPassword,
  adminChangePassword
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

// User management
router.route('/users').get(getUsers);
router.route('/users/:id').delete(deleteUser);
router.route('/posts/:id').delete(deletePost);

// Recruiter management
router.route('/recruiters').get(getRecruiters).post(createRecruiter);
router.route('/recruiter/:id/reset-password').put(resetRecruiterPassword);

// Admin password management
router.route('/change-password').put(adminChangePassword);

module.exports = router;
