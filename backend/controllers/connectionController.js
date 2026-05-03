const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send connection request
// @route   POST /api/connections/request/:id
// @access  Private
exports.sendRequest = async (req, res) => {
  try {
    const userToConnect = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToConnect) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already connected or request already sent
    if (userToConnect.connections.includes(currentUser._id) || 
        userToConnect.connectionRequests.includes(currentUser._id)) {
      return res.status(400).json({ message: 'Request already sent or already connected' });
    }

    userToConnect.connectionRequests.push(currentUser._id);
    await userToConnect.save();

    // Notify the target user
    await Notification.create({
      recipient: userToConnect._id,
      type: 'Connection',
      relatedUser: currentUser._id
    });

    res.json({ message: 'Connection request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept connection request
// @route   POST /api/connections/accept/:id
// @access  Private
exports.acceptRequest = async (req, res) => {
  try {
    const requestingUserId = req.params.id;
    const currentUser = await User.findById(req.user._id);
    const requestingUser = await User.findById(requestingUserId);

    if (!currentUser.connectionRequests.includes(requestingUserId)) {
      return res.status(400).json({ message: 'No request found' });
    }

    // Add to connections
    currentUser.connections.push(requestingUserId);
    requestingUser.connections.push(currentUser._id);

    // Remove from requests
    currentUser.connectionRequests = currentUser.connectionRequests.filter(
      (id) => id.toString() !== requestingUserId.toString()
    );

    await currentUser.save();
    await requestingUser.save();

    res.json({ message: 'Connection accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject connection request
// @route   POST /api/connections/reject/:id
// @access  Private
exports.rejectRequest = async (req, res) => {
  try {
    const requestingUserId = req.params.id;
    const currentUser = await User.findById(req.user._id);

    if (!currentUser.connectionRequests.includes(requestingUserId)) {
      return res.status(400).json({ message: 'No request found' });
    }

    // Remove from requests
    currentUser.connectionRequests = currentUser.connectionRequests.filter(
      (id) => id.toString() !== requestingUserId.toString()
    );

    await currentUser.save();

    res.json({ message: 'Connection rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all connections
// @route   GET /api/connections
// @access  Private
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections', 'name profilePicture headline')
      .populate('connectionRequests', 'name profilePicture headline');
      
    let connections = [...user.connections];

    const Job = require('../models/Job');
    // If recruiter, also include applicants in the messaging list
    if (req.user.role === 'Recruiter' || req.user.role === 'Admin') {
      const jobs = await Job.find({ recruiter: req.user._id }).populate('applicants.user', 'name profilePicture headline');
      
      jobs.forEach(job => {
        job.applicants.forEach(app => {
          if (app.user && !connections.some(c => c._id.toString() === app.user._id.toString())) {
            connections.push(app.user);
          }
        });
      });
    }

    // If candidate, also include recruiters of jobs they applied to
    if (req.user.role === 'User') {
      const appliedJobs = await Job.find({ 'applicants.user': req.user._id }).populate('recruiter', 'name profilePicture headline');
      
      appliedJobs.forEach(job => {
        if (job.recruiter && !connections.some(c => c._id.toString() === job.recruiter._id.toString())) {
          connections.push(job.recruiter);
        }
      });
    }
      
    res.json({
      connections: connections,
      requests: user.connectionRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
