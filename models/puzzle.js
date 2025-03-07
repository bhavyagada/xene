'use strict';
module.exports = (sequelize, DataTypes) => {
  const Puzzle = sequelize.define('Puzzle', {
    name: {
      type: DataTypes.STRING(63),
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(127),
    },
    keys: DataTypes.STRING,
    hints: DataTypes.TEXT,
    test_cases: DataTypes.TEXT,
  }, {timestamps: false});
  
  return Puzzle;
};