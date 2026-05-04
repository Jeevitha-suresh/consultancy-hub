const { Job, User, Notification, JobApplication } = require('../models_sql');
const { Op } = require('sequelize');

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
exports.createJob = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    if (role !== 'recruiter' && role !== 'admin') {
      return res.status(403).json({ message: 'Only recruiters can post jobs' });
    }

    const { title, company, location, description, requirements, salary } = req.body;

    const job = await Job.create({
      recruiterId: req.user.id,
      title,
      company,
      location,
      description,
      requirements: typeof requirements === 'string' ? requirements.split(',').map(req => req.trim()) : requirements,
      salary
    });

    // Notify all candidates about new job
    const candidates = await User.findAll({ where: { role: 'User' } });
    for (const candidate of candidates) {
      await Notification.create({
        recipientId: candidate.id,
        type: 'Job',
        relatedUserId: req.user.id
      });
    }

    res.status(201).json({ ...job.toJSON(), _id: job.id });
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
            [Op.like]: `%${req.query.keyword}%`
          },
        }
      : {};

    const jobs = await Job.findAll({
      where: keyword,
      include: [
        { model: User, as: 'recruiter', attributes: ['name', 'company', 'profilePicture'] },
        { model: User, as: 'applicants', attributes: ['id'] }
      ]
    });
    
    console.log(`🔍 Found ${jobs.length} jobs in MySQL`);
    const mapped = jobs.map(j => {
      const job = j.toJSON();
      return {
        ...job,
        _id: job.id,
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        applicants: Array.isArray(job.applicants) ? job.applicants.map(a => ({ ...a, _id: a.id })) : []
      };
    });
    
    if (mapped.length > 0) console.log('First job sample:', JSON.stringify(mapped[0], null, 2));
    res.json(mapped);
  } catch (error) {
    console.error('❌ getJobs Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
exports.applyJob = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() === 'recruiter') {
      return res.status(403).json({ message: 'Recruiters cannot apply for jobs' });
    }

    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if already applied
    const alreadyApplied = await JobApplication.findOne({
      where: { JobId: job.id, UserId: req.user.id }
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    let resumeUrl = null;
    if (req.file) {
      resumeUrl = `/uploads/${req.file.filename}`;
    } else {
      const user = await User.findByPk(req.user.id);
      resumeUrl = user?.resume || null;
    }

    await JobApplication.create({
      JobId: job.id,
      UserId: req.user.id,
      resumeUrl
    });

    // Notify recruiter
    await Notification.create({
      recipientId: job.recruiterId,
      type: 'Job',
      relatedUserId: req.user.id
    });

    res.json({ message: 'Application submitted successfully', resumeUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get job applicants (Recruiter only)
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ 
        model: User, 
        as: 'applicants', 
        attributes: ['id', 'name', 'email', 'headline', 'profilePicture'],
        through: { attributes: ['status', 'resumeUrl', 'appliedAt'] }
      }]
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const role = req.user.role.toLowerCase();
    if (job.recruiterId !== req.user.id && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Transform for frontend
    const applicants = job.applicants.map(u => ({
      _id: `${job.id}-${u.id}`,
      user: { ...u.toJSON(), _id: u.id },
      status: u.JobApplication.status,
      resumeUrl: u.JobApplication.resumeUrl,
      appliedAt: u.JobApplication.appliedAt
    }));

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recruiter's own jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({ 
      where: { recruiterId: req.user.id },
      include: [{
        model: User,
        as: 'applicants',
        attributes: ['id']
      }],
      order: [['createdAt', 'DESC']]
    });
    const mapped = jobs.map(j => ({ ...j.toJSON(), _id: j.id }));
    console.log(`🔍 Found ${jobs.length} personal jobs for recruiter ${req.user.id}`);
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const role = req.user.role.toLowerCase();
    if (job.recruiterId !== req.user.id && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, company, location, description, requirements, salary } = req.body;
    await job.update({
      title: title || job.title,
      company: company || job.company,
      location: location || job.location,
      description: description || job.description,
      requirements: requirements ? (typeof requirements === 'string' ? requirements.split(',').map(r => r.trim()) : requirements) : job.requirements,
      salary: salary !== undefined ? salary : job.salary
    });

    res.json({ ...job.toJSON(), _id: job.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const role = req.user.role.toLowerCase();
    if (job.recruiterId !== req.user.id && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get candidate's applied jobs
exports.getMyApplications = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Job,
        as: 'appliedJobs',
        include: [{ model: User, as: 'recruiter', attributes: ['id', 'name', 'profilePicture', 'company'] }]
      }]
    });

    const applications = user.appliedJobs.map(job => ({
      _id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      recruiter: job.recruiter,
      status: job.JobApplication.status,
      appliedAt: job.JobApplication.appliedAt
    })).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update applicant status
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const role = req.user.role.toLowerCase();
    if (job.recruiterId !== req.user.id && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const application = await JobApplication.findOne({
      where: { JobId: req.params.id, UserId: req.params.userId }
    });

    if (!application) return res.status(404).json({ message: 'Applicant not found' });

    application.status = status;
    await application.save();

    // Notify candidate
    await Notification.create({
      recipientId: req.params.userId,
      type: 'Job',
      relatedUserId: req.user.id
    });

    res.json({ message: 'Status updated successfully', status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applicants across recruiter's jobs
exports.getAllApplicants = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { recruiterId: req.user.id },
      include: [{
        model: User,
        as: 'applicants',
        attributes: ['id', 'name', 'email', 'headline', 'profilePicture'],
        through: { attributes: ['status', 'resumeUrl', 'appliedAt'] }
      }]
    });

    const applicants = [];
    jobs.forEach(job => {
      job.applicants.forEach(app => {
        applicants.push({
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          applicantId: `${job.id}-${app.id}`, // Use composite ID
          user: { ...app.toJSON(), _id: app.id },
          status: app.JobApplication.status,
          resumeUrl: app.JobApplication.resumeUrl || null,
          appliedAt: app.JobApplication.appliedAt
        });
      });
    });

    console.log(`🔍 Found ${applicants.length} total applicants for recruiter ${req.user.id}`);
    console.log('Applicants Data:', JSON.stringify(applicants, null, 2));
    res.json(applicants);
  } catch (error) {
    console.error('❌ getAllApplicants Error:', error);
    res.status(500).json({ message: error.message });
  }
};
