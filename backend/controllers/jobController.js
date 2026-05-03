const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== 'Recruiter' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only recruiters can post jobs' });
    }

    const { title, company, location, description, requirements, salary } = req.body;

    const job = await Job.create({
      recruiter: req.user._id,
      title,
      company,
      location,
      description,
      requirements: requirements.split(',').map(req => req.trim()),
      salary
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const jobs = await Job.find({ ...keyword }).populate('recruiter', 'name company profilePicture');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for a job (with optional resume upload)
// @route   POST /api/jobs/:id/apply
// @access  Private
exports.applyJob = async (req, res) => {
  try {
    if (req.user.role === 'Recruiter') {
      return res.status(403).json({ message: 'Recruiters cannot apply for jobs' });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.find(
      (a) => a.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Determine resume URL: uploaded file > user profile resume
    let resumeUrl = null;
    if (req.file) {
      resumeUrl = `/uploads/${req.file.filename}`;
    } else {
      // Fall back to user's saved profile resume
      const user = await User.findById(req.user._id).select('resume');
      resumeUrl = user?.resume || null;
    }

    job.applicants.push({ user: req.user._id, resumeUrl });
    await job.save();

    // Notify recruiter
    await Notification.create({
      recipient: job.recruiter,
      type: 'Job',
      relatedUser: req.user._id
    });

    res.json({ message: 'Application submitted successfully', resumeUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get job applicants (Recruiter only)
// @route   GET /api/jobs/:id/applicants
// @access  Private (Recruiter)
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('applicants.user', 'name email headline profilePicture');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view these applicants' });
    }

    res.json(job.applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recruiter's own jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter)
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    const { title, company, location, description, requirements, salary } = req.body;
    if (title) job.title = title;
    if (company) job.company = company;
    if (location) job.location = location;
    if (description) job.description = description;
    if (requirements) job.requirements = typeof requirements === 'string' ? requirements.split(',').map(r => r.trim()) : requirements;
    if (salary !== undefined) job.salary = salary;

    const updated = await job.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get candidate's applied jobs
// @route   GET /api/jobs/my-applications
// @access  Private (User/Candidate)
exports.getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applicants.user': req.user._id })
      .populate('recruiter', 'name profilePicture')
      .sort({ createdAt: -1 });

    const applications = jobs.map(job => {
      const applicant = job.applicants.find(a => a.user.toString() === req.user._id.toString());
      return {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        recruiter: job.recruiter,
        status: applicant?.status || 'Pending',
        appliedAt: applicant?.appliedAt
      };
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update applicant status (Recruiter)
// @route   PUT /api/jobs/:id/applicants/:userId/status
// @access  Private (Recruiter/Admin)
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Reviewed', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applicant = job.applicants.find(a => a.user.toString() === req.params.userId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.status = status;
    await job.save();

    // Notify candidate
    await Notification.create({
      recipient: req.params.userId,
      type: 'Job',
      relatedUser: req.user._id
    });

    res.json({ message: 'Status updated successfully', status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applicants across recruiter's jobs (Recruiter dashboard)
// @route   GET /api/jobs/all-applicants
// @access  Private (Recruiter)
exports.getAllApplicants = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
      .populate('applicants.user', 'name email headline profilePicture resume');

    const applicants = [];
    jobs.forEach(job => {
      job.applicants.forEach(app => {
        applicants.push({
          jobId: job._id,
          jobTitle: job.title,
          company: job.company,
          applicantId: app._id,
          user: app.user,
          status: app.status,
          resumeUrl: app.resumeUrl || null,
          appliedAt: app.appliedAt
        });
      });
    });

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
