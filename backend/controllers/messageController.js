const { Message, User } = require('../models_sql');
const { Op, sequelize } = require('sequelize');

// @desc    Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const currentUserId = req.user.id;
    
    // Determine the participant who is NOT the current user
    let participantId = userId;
    if (userId == currentUserId && otherUserId) {
      participantId = otherUserId;
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: participantId },
          { senderId: participantId, receiverId: currentUserId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    console.log(`🔍 Found ${messages.length} messages between ${req.user.id} and ${req.params.userId}`);
    res.json(messages.map(m => ({ 
      ...m.toJSON(), 
      _id: m.id,
      sender: m.senderId,
      receiver: m.receiverId,
      content: m.content
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for the logged-in user
exports.getConversations = async (req, res) => {
  try {
    // Find unique users who have exchanged messages with current user
    const conversations = await Message.findAll({
      attributes: [
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastMessageAt'],
        [sequelize.literal(`CASE WHEN senderId = ${req.user.id} THEN receiverId ELSE senderId END`), 'otherUserId']
      ],
      where: {
        [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }]
      },
      group: ['otherUserId'],
      order: [[sequelize.literal('lastMessageAt'), 'DESC']]
    });

    const results = await Promise.all(conversations.map(async (conv) => {
      const otherUser = await User.findByPk(conv.getDataValue('otherUserId'), {
        attributes: ['id', 'name', 'profilePicture', 'headline']
      });
      
      const lastMessage = await Message.findOne({
        where: {
          [Op.or]: [
            { senderId: req.user.id, receiverId: otherUser.id },
            { senderId: otherUser.id, receiverId: req.user.id }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      return {
        _id: otherUser.id,
        name: otherUser.name,
        profilePicture: otherUser.profilePicture,
        headline: otherUser.headline,
        lastMessage: lastMessage.content,
        timestamp: lastMessage.createdAt
      };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message (REST fallback)
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content
    });

    // Notify receiver
    const { Notification } = require('../models_sql');
    await Notification.create({
      recipientId: receiverId,
      type: 'Message',
      relatedUserId: req.user.id
    });

    res.status(201).json({ ...message.toJSON(), _id: message.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
