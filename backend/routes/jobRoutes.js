const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  applyJob,
  getJobApplicants,
  getMyJobs,
  updateJob,
  deleteJob,
  getMyApplications,
  updateApplicantStatus,
  getAllApplicants
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// IMPORTANT: Static routes must come before /:id param routes
router.get('/my-jobs', protect, getMyJobs);
router.get('/my-applications', protect, getMyApplications);
router.get('/all-applicants', protect, getAllApplicants);

router.route('/')
  .get(protect, getJobs)
  .post(protect, createJob);

// Apply route accepts an optional resume file upload
router.route('/:id/apply').post(protect, upload.single('resume'), applyJob);
router.route('/:id/applicants').get(protect, getJobApplicants);
router.route('/:id/applicants/:userId/status').put(protect, updateApplicantStatus);
router.route('/:id').put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
