const { Challenge, Puzzle } = require('../../sequelize')

exports.getChallenges = function (req, res) {
    Challenge.findAll({ raw: true, order: [['id', 'ASC']] })
        .then(challenges => {
            res.json(challenges);
        })
        .catch(err => console.log(err));
};

exports.getChallengesWithPuzzles = function (req, res) {
    Challenge.findAll({ order: [['id', 'ASC']], include: [{ model: Puzzle, as: 'puzzles' }] })
        .then(challenges => {
            res.json(challenges);
        })
        .catch(err => console.log(err));
};

exports.getChallenge = function (req, res) {
    Challenge.findOne({ where: { id: req.params.id }, include: [{ model: Puzzle, as: 'puzzles' }] })
        .then(challenge => {
            res.json(challenge);
        })
        .catch(err => console.log(err));
};

exports.getPuzzles = function (req, res) {
    Challenge.findOne({ where: { id: req.params.id }, include: [{ model: Puzzle, as: 'puzzles' }] })
        .then(challenge => {
            res.json(challenge.puzzles);
        })
        .catch(err => console.log(err));
};