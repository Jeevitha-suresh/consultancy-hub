const { User, Notification, Connection, Job, JobApplication } = require('../models_sql');
const { Op } = require('sequelize');

// @desc    Send connection request
exports.sendRequest = async (req, res) => {
  try {
    const userToConnectId = req.params.id;
    if (userToConnectId == req.user.id) return res.status(400).json({ message: 'Cannot connect to self' });

    const existing = await Connection.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, connectionId: userToConnectId },
          { userId: userToConnectId, connectionId: req.user.id }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already exists or already connected' });
    }

    await Connection.create({
      userId: req.user.id,
      connectionId: userToConnectId,
      status: 'Pending'
    });

    // Notify the target user
    await Notification.create({
      recipientId: userToConnectId,
      type: 'Connection',
      relatedUserId: req.user.id
    });

    res.json({ message: 'Connection request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept connection request
exports.acceptRequest = async (req, res) => {
  try {
    const requestingUserId = req.params.id;
    const connection = await Connection.findOne({
      where: { userId: requestingUserId, connectionId: req.user.id, status: 'Pending' }
    });

    if (!connection) {
      return res.status(400).json({ message: 'No request found' });
    }

    connection.status = 'Accepted';
    await connection.save();

    res.json({ message: 'Connection accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject connection request
exports.rejectRequest = async (req, res) => {
  try {
    const requestingUserId = req.params.id;
    const connection = await Connection.findOne({
      where: { userId: requestingUserId, connectionId: req.user.id, status: 'Pending' }
    });

    if (!connection) {
      return res.status(400).json({ message: 'No request found' });
    }

    await connection.destroy();
    res.json({ message: 'Connection rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all connections
exports.getConnections = async (req, res) => {
  try {
    // Accepted connections
    const connections = await Connection.findAll({
      where: {
        status: 'Accepted',
        [Op.or]: [{ userId: req.user.id }, { connectionId: req.user.id }]
      }
    });

    const friendIds = connections.map(c => c.userId == req.user.id ? c.connectionId : c.userId);
    
    // People who sent request to me (Pending)
    const requests = await Connection.findAll({
      where: { connectionId: req.user.id, status: 'Pending' },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture', 'headline'] }]
    });

    const friends = await User.findAll({
      where: { id: { [Op.in]: friendIds } },
      attributes: ['id', 'name', 'profilePicture', 'headline']
    });

    // Handle cross-role connections (Recruiters <-> Applicants)
    const extraIds = new Set();
    const role = req.user.role.toLowerCase();

    if (role === 'recruiter' || role === 'admin') {
      const jobs = await Job.findAll({ 
        where: { recruiterId: req.user.id },
        include: [{ model: User, as: 'applicants', attributes: ['id'] }]
      });
      jobs.forEach(j => j.applicants.forEach(a => extraIds.add(a.id)));
    } else {
      const applications = await JobApplication.findAll({
        where: { UserId: req.user.id },
        include: [{ model: Job, include: [{ model: User, as: 'recruiter', attributes: ['id'] }] }]
      });
      applications.forEach(a => { if(a.Job?.recruiter) extraIds.add(a.Job.recruiter.id); });
    }

    const finalFriendIds = [...new Set([...friendIds, ...extraIds])];
    const finalFriends = await User.findAll({
      where: { id: { [Op.in]: finalFriendIds } },
      attributes: ['id', 'name', 'profilePicture', 'headline']
    });

    res.json({
      connections: finalFriends.map(f => ({ ...f.toJSON(), _id: f.id })),
      requests: requests.map(r => ({ ...r.user.toJSON(), _id: r.user.id }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
