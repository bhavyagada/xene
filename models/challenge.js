'use strict';
module.exports = (sequelize, DataTypes) => {
  const Challenge = sequelize.define('Challenge', {
    name: {
      type: DataTypes.STRING(63),
      unique: true,
      allowNull: false
    },
    // key: {
    //   type: DataTypes.STRING(31),
    //   allowNull: true
    // }
  }, {timestamps: false});

  return Challenge;
};