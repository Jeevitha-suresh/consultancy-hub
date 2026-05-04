const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql_db');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.JSON, // Array of strings
    allowNull: false
  },
  salary: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = Job;
