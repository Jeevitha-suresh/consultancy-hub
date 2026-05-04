const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql_db');
const User = require('./User');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Connection', 'Like', 'Comment', 'Job', 'Message'),
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

// Associations
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

Notification.belongsTo(User, { foreignKey: 'relatedUserId', as: 'relatedUser' });

module.exports = Notification;
