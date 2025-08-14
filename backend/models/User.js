const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  picture: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      emailsPerPage: 20,
      theme: 'light',
    },
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['googleId'],
    },
    {
      unique: true,
      fields: ['email'],
    },
  ],
});

module.exports = User; 