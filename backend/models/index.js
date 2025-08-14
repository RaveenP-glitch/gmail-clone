const User = require('./User');
const Email = require('./Email');

// Define associations
User.hasMany(Email, {
  foreignKey: 'userId',
  as: 'emails',
  onDelete: 'CASCADE',
});

Email.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  User,
  Email,
}; 