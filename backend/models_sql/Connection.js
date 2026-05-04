const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql_db');

const Connection = sequelize.define('Connection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted'),
    defaultValue: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = Connection;
