const { Notification, User } = require('../models_sql');

// @desc    Get notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ 
      where: { recipientId: req.user.id },
      include: [{ model: User, as: 'relatedUser', attributes: ['name', 'profilePicture'] }],
      order: [['createdAt', 'DESC']],
      limit: 30
    });
    
    const mapped = notifications.map(n => ({ ...n.toJSON(), _id: n.id }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.update({ read: true }, { 
      where: { recipientId: req.user.id, read: false } 
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({ 
      where: { recipientId: req.user.id, read: false } 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
