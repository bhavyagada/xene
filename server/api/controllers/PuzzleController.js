import axios from 'axios'
const { Puzzle } = require('../../sequelize')

exports.getPuzzles = function (req, res) {
    if (req.query.secret == process.env.API_SECRET) {
        Puzzle.findAll({ raw: true })
        .then(puzzles => {
            res.json(puzzles);
        })
        .catch(err => console.log(err));
    } else {
        res.json('Invalid API Secret');
    }    
};

exports.getPuzzle = function (req, res) {
    Puzzle.findOne({ where: { id: req.params.id }, raw: true })
        .then(puzzle => {
            res.json(puzzle);
        })
        .catch(err => console.log(err));
};


exports.getChallenge = function (req, res) {
    Puzzle.findOne({ where: { id: req.params.id }, raw: true })
        .then(puzzle => {
            puzzle.getChallenge()
                .then(challenge => res.json(challenge));
        })
        .catch(err => console.log(err));
};

exports.interpretCode = function (req, res) {
    Puzzle.findOne({ where: { id: req.params.id }, raw: true })
        .then(puzzle => {
            let casesSource = JSON.parse(puzzle.test_cases)
            let cases = casesSource.visible;
            let hiddenCases = casesSource.hidden;            

            axios.post('https://gointerpreter.herokuapp.com', {Params: cases, HiddenParams:hiddenCases, Code: req.body.serializedCode })
            .then(data => {
                res.json(data.data);
            })
            .catch(err => res.json({
                "Success": false,
                "Message": err
            }));
        })
        .catch(err => console.log(err));


}