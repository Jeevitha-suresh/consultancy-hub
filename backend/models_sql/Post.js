const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql_db');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = Post;
