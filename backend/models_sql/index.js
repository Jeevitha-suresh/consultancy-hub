const User = require('./User');
const Job = require('./Job');
const Post = require('./Post');
const Notification = require('./Notification');
const Message = require('./Message');
const Connection = require('./Connection');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql_db');

// Job - User (Recruiter)
User.hasMany(Job, { foreignKey: 'recruiterId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });

// Job Application (Many-to-Many between User and Job)
const JobApplication = sequelize.define('JobApplication', {
  status: {
    type: DataTypes.ENUM('Pending', 'Reviewed', 'Accepted', 'Rejected'),
    defaultValue: 'Pending'
  },
  resumeUrl: {
    type: DataTypes.STRING
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

User.belongsToMany(Job, { through: JobApplication, as: 'appliedJobs' });
Job.belongsToMany(User, { through: JobApplication, as: 'applicants' });

// Post - User (Author)
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Post Likes (Many-to-Many)
const PostLike = sequelize.define('PostLike', {});
User.belongsToMany(Post, { through: PostLike, as: 'likedPosts' });
Post.belongsToMany(User, { through: PostLike, as: 'likes' });

// Comments
const Comment = sequelize.define('Comment', {
  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// Messages
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Connections (Self-referential Many-to-Many)
User.belongsToMany(User, { 
  through: Connection, 
  as: 'userConnections', 
  foreignKey: 'userId', 
  otherKey: 'connectionId' 
});

module.exports = {
  User,
  Job,
  Post,
  JobApplication,
  PostLike,
  Comment,
  Notification,
  Message,
  Connection,
  sequelize
};
