'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserPuzzles = sequelize.define('UserPuzzles', {
    userSub: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'sub'
      }
    },
    puzzleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Puzzles',
        key: 'id'
      },
    },
    code: DataTypes.TEXT,
    edits: DataTypes.INTEGER,
    time: DataTypes.INTEGER,
    conciseness: DataTypes.INTEGER,
    complexity: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
  }, {timestamps: false});

  return UserPuzzles;
};