'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    sub: {
      type: DataTypes.STRING(63),
      primaryKey: true
    }
  }, {timestamps: false});
  
  return User;
};