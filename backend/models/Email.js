const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Email = sequelize.define('Email', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gmailId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  threadId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fromName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fromEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  toEmails: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ccEmails: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  bccEmails: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  bodyText: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  bodyHtml: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  labels: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isStarred: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isImportant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  snippet: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'emails',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['messageId'],
    },
    {
      unique: true,
      fields: ['userId', 'gmailId'],
    },
    {
      fields: ['fromEmail'],
    },
    {
      fields: [{ name: 'subject', length: 255 }],
    },
    {
      fields: ['date'],
    },
    {
      fields: ['isRead'],
    },
    {
      fields: ['isStarred'],
    },
  ],
});

module.exports = Email; 