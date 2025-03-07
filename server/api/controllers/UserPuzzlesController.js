const { User, Puzzle, UserPuzzles } = require('../../sequelize')

const { getUserFromAuth0 } = require('./UserController');

exports.getUserPuzzlesForChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0'];
    if (token) {
        return getUserFromAuth0(token)
            .then(user => {
                return User.findOne({ where: { sub: user.sub } })
                    .then(userObj => {
                        let challengeObject = {};
                        if (req.params.id) {
                            challengeObject = { challengeId: req.params.id };
                        }
                        if (userObj) {
                            return userObj.getPuzzles({ where: challengeObject })
                                .then(puzzles => {                                     
                                    return res.json(puzzles.map(puzzle => {
                                        let res = {}
                                        res['id'] = puzzle.id
                                        res['challengeId'] = puzzle.challengeId
                                        res['name'] = puzzle.name
                                        res['UserPuzzles'] = {}
                                        res.UserPuzzles['score'] = puzzle.UserPuzzles.score
                                        return res
                                    }))
                                })
                                .catch(err => console.log(err));
                        } else {
                            return User.findOrCreate({ where: { sub: user.sub }, defaults: { sub: user.sub } })
                                .then(newUser => {
                                    res.json([])
                                })
                                .catch(err => console.log(err));
                        }

                    })
            })
            .catch(err => console.log(err));
    } else {
        res.json('Guest User')
    }
};

exports.getDisabledKeys = function (req, res) {
    let token = req.cookies['auth._token.auth0'];
    if (token) {
        getUserFromAuth0(token)
            .then(user => {
                return Puzzle.findAll({ attributes: ['id', 'keys'], raw: true })
                    .then(keys => {
                        return UserPuzzles.findAll({ attributes: ['puzzleId'], where: { userSub: user.sub }, raw: true })
                            .then(user_puzzles => {
                                let user_keys = []
                                user_puzzles.forEach(puzzle => {
                                    let keyObj = keys.find(key => key.id == puzzle.puzzleId)
                                    if (keyObj) user_keys.push(JSON.parse(keyObj.keys))
                                })
                                keys = [].concat.apply([], keys.map(key => JSON.parse(key.keys)))
                                user_keys = [].concat.apply([], user_keys)

                                return res.json(keys.filter(x => !user_keys.includes(x)))
                            })
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    } else {
        res.json('Guest User')
    }
};

function getUserPuzzle(id, sub) {
    return UserPuzzles.findOne({
        where: { puzzleId: id, userSub: sub },
        raw: true,
    })
        .then(user_puzzle => {
            if (user_puzzle)
                return { success: true, ...user_puzzle }
            else
                return { success: false }
        })
        .catch(err => console.log(err))
}
exports.getPuzzle = function (req, res) {
    let token = req.cookies['auth._token.auth0'];
    if (token) {
        getUserFromAuth0(token)
            .then(user => {
                getUserPuzzle(req.params.id, user.sub)
                    .then(user_puzzle => {
                        return res.json(user_puzzle)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err));
    } else {
        res.json('Guest User')
    }
};
exports.savePuzzle = function (req, res) {
    let token = req.cookies['auth._token.auth0'];
    if (token) {
        getUserFromAuth0(token)
            .then(user => {
                getUserPuzzle(req.params.id, user.sub)
                    .then(user_puzzle => {
                        const calcTime = (x) => 50 * Math.max(0, 20 - x)
                        const calcEdits = (x) => 20 * Math.max(0, 50 - x)                        
                        const calcToken = (x) => 10 * Math.max(0, 100 - x)
                        const calcCyclomaticComplexity = (x) => 50 * Math.max(0, (20 - x.filter(y => y == "if" || y == "while" || y == "foreach").length))

                        let tokens = req.body.tokens
                        const time = calcTime(req.body.time)
                        const edits = calcEdits(Math.max(0, req.body.edits - tokens.length))
                        const conciseness = calcToken(tokens.length)
                        const complexity = calcCyclomaticComplexity(tokens)
                        const score = time + edits + conciseness + complexity;

                        if (user_puzzle.success) {
                            if (user_puzzle.score > score) {
                                return res.json({ new: false, updated: false, time, edits, conciseness, complexity, score, userSub: user.sub, old_score: { ...user_puzzle } })
                            } else {
                                UserPuzzles.update({ code: req.body.code, time, edits, conciseness, complexity, score, userSub: user.sub, }, { where: { puzzleId: req.params.id, userSub: user.sub } })
                                    .then(userpuzzle => {
                                        return res.json({ new: false, updated: true, time, edits, conciseness, complexity, score, userSub: user.sub, old_score: { ...user_puzzle } })
                                    })
                                    .catch(err => res.json(err));
                            }
                        } else {
                            UserPuzzles.create({ puzzleId: req.params.id, userSub: user.sub, code: req.body.code, time, edits, conciseness, complexity, score })
                                .then(userpuzzle => {
                                    return res.json({ new: true, updated: false, time, edits, conciseness, complexity, score })
                                })
                                .catch(err => res.json(err));
                        }
                    })
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};