const Sequelize = require('sequelize')
const { User, Challenge, Puzzle, UserPuzzles } = require('../../sequelize')
const { getUserFromAuth0, fetchUsersFromAuth0 } = require('./UserController');

function getPuzzlesForChallenge(id) {
    return Challenge.findByPk(id)
        .then(challenge => {
            return challenge.getPuzzles({ attributes: ['id', 'name'] })
                .then(puzzles => {
                    return puzzles;
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}

exports.fetchUserPuzzlesForChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return getUserFromAuth0(token)
            .then(user => {
                return getPuzzlesForChallenge(req.params.id)
                    .then(puzzles => {
                        return UserPuzzles.findAll({ attributes: ['userSub', 'puzzleId', 'edits', 'time', 'conciseness', 'complexity', 'score'], where: { userSub: user.sub, puzzleId: puzzles.map(puzzle => puzzle.id) }, order: [['puzzleId', 'ASC']], raw: true })
                            .then(user_puzzles => {
                                if (user_puzzles.length) {
                                    return res.json(user_puzzles)
                                } else {
                                    return res.json({ success: false })
                                }
                            })
                    })
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
}

function fetchPuzzles(puzzles) {
    return UserPuzzles.findAll({ attributes: ['userSub', 'puzzleId', 'edits', 'time', 'conciseness', 'complexity', 'score'], where: { puzzleId: puzzles }, order: [['puzzleId', 'ASC']], raw: true })
        .then(user_puzzles => {
            return user_puzzles
        })
        .catch(err => console.log(err))
}
exports.fetchPuzzlesForChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return getPuzzlesForChallenge(req.params.id)
            .then(puzzles => {
                return fetchPuzzles(puzzles.map(puzzle => puzzle.id))
                    .then(user_puzzles => {
                        return res.json(user_puzzles)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
}

exports.fetchPuzzle = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return fetchPuzzles(req.params.id)
            .then(user_puzzles => {
                return res.json(user_puzzles)
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
}

function userCounts(puzzles) {
    return UserPuzzles.findAll({
        group: ['puzzleId'],
        attributes: ['puzzleId', [Sequelize.fn('COUNT', 'puzzleId'), 'Users']],
        where: {
            puzzleId: puzzles
        },
        raw: true
    })
        .then(user_puzzles => {
            return user_puzzles
        })
        .catch(err => console.log(err))
}

exports.userCountsForChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return getPuzzlesForChallenge(req.params.id)
            .then(puzzles => {
                return userCounts(puzzles.map(puzzle => puzzle.id))
                    .then(user_puzzles => {
                        return res.json(user_puzzles)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};

exports.userCountsForPuzzle = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return userCounts(req.params.id)
            .then(user_puzzles => {
                return res.json(user_puzzles)
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};

exports.sumScoresForChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return getPuzzlesForChallenge(req.params.id)
            .then(puzzles => {
                return UserPuzzles.findAll({ where: { puzzleId: puzzles.map(puzzle => puzzle.id) }, raw: true })
                    .then(user_puzzles => {
                        let result = []
                        let subs = [...new Set(user_puzzles.map(item => item.userSub))]

                        subs.forEach(sub => {
                            let puzzles = user_puzzles.filter(user_puzzle => user_puzzle.userSub == sub)

                            let sum = (field) => puzzles.map(puzzle => puzzle[field]).reduce((a, b) => a + b)

                            let time = sum('time')
                            let edits = sum('edits')
                            let conciseness = sum('conciseness')
                            let complexity = sum('complexity')
                            let score = sum('score')

                            result.push({ sub, time, edits, conciseness, complexity, score })
                        })

                        result = result.sort((a, b) => b.score - a.score).slice(0, 10)
                        return fetchUsersFromAuth0(result.map(x => x.sub))
                            .then(users => {
                                return res.json({ users, result })
                            })
                            .catch(err => console.error(err))
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};

exports.averageScoresForChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return getPuzzlesForChallenge(req.params.id)
            .then(puzzles => {
                return UserPuzzles.findAll({ where: { puzzleId: puzzles.map(puzzle => puzzle.id) }, order: [['puzzleId', 'ASC']], raw: true })
                    .then(user_puzzles => {
                        let result = []
                        let ids = [...new Set(user_puzzles.map(item => item.puzzleId))]

                        ids.forEach(id => {
                            let puzzles = user_puzzles.filter(user_puzzle => user_puzzle.puzzleId == id)

                            let average = (field) => Math.round(puzzles.map(puzzle => puzzle[field]).reduce((a, b) => a + b) / puzzles.length)

                            let time = average('time')
                            let edits = average('edits')
                            let conciseness = average('conciseness')
                            let complexity = average('complexity')
                            let score = average('score')

                            result.push({ id, time, edits, conciseness, complexity, score })
                        })
                        return res.json(result)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};

exports.bestScoreForChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return getUserFromAuth0(token)
            .then(user => {
                return getPuzzlesForChallenge(req.params.id)
                    .then(puzzles => {
                        return UserPuzzles.findAll({ where: { userSub: user.sub, puzzleId: puzzles.map(puzzle => puzzle.id) }, raw: true })
                            .then(user_puzzles => {
                                return UserPuzzles.findAll({ where: { puzzleId: puzzles.map(puzzle => puzzle.id) }, raw: true })
                                    .then(users_puzzles => {
                                        let result = {}

                                        let sum = (puzzles, field) => puzzles.map(puzzle => puzzle[field]).reduce((a, b) => a + b)

                                        if (user_puzzles.length) {
                                            let time = sum(user_puzzles, 'time')
                                            let edits = sum(user_puzzles, 'edits')
                                            let conciseness = sum(user_puzzles, 'conciseness')
                                            let complexity = sum(user_puzzles, 'complexity')
                                            let score = sum(user_puzzles, 'score')

                                            result['user'] = { time, edits, conciseness, complexity, score, userSub: user.sub }
                                        } else {
                                            result['user'] = { time: 0, edits: 0, conciseness: 0, complexity: 0, score: 0, userSub: user.sub }
                                        }

                                        if (users_puzzles) {
                                            let subs = [...new Set(users_puzzles.map(item => item.userSub))]
                                            let best_score = { time: 0, edits: 0, conciseness: 0, complexity: 0, score: 0 }

                                            subs.forEach(sub => {
                                                let puzzles = users_puzzles.filter(user_puzzle => user_puzzle.userSub == sub)

                                                let time = sum(puzzles, 'time')
                                                let edits = sum(puzzles, 'edits')
                                                let conciseness = sum(puzzles, 'conciseness')
                                                let complexity = sum(puzzles, 'complexity')
                                                let score = sum(puzzles, 'score')

                                                if (score > best_score.score) {
                                                    best_score = { time, edits, conciseness, complexity, score, userSub: sub }
                                                }
                                            })
                                            result['best_user'] = best_score
                                        } else {
                                            result['best_user'] = { time: 0, edits: 0, conciseness: 0, complexity: 0, score: 0, userSub: '' }
                                        }

                                        return res.json(result)
                                    })
                                    .catch(err => console.log(err))
                            })
                    })
            })

            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};



exports.bestPuzzlesScoreForChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return getUserFromAuth0(token)
            .then(user => {
                return getPuzzlesForChallenge(req.params.id)
                    .then(puzzles => {
                        return UserPuzzles.findAll({ where: { userSub: user.sub, puzzleId: puzzles.map(puzzle => puzzle.id) }, raw: true })
                            .then(user_puzzles => {
                                return UserPuzzles.findAll({ where: { puzzleId: puzzles.map(puzzle => puzzle.id) }, raw: true })
                                    .then(users_puzzles => {
                                        let user_result = {};

                                        puzzles.forEach(x => user_result[x.id] = 0)

                                        puzzles.forEach(puzzle => {
                                            let user_puzzle = user_puzzles.find(x => x.puzzleId == puzzle.id)
                                            if (user_puzzle && user_puzzle.score > user_result[puzzle.id]) {
                                                user_result[puzzle.id] = user_puzzle.score
                                            }
                                            user_result[puzzles.find(x => x.id == puzzle.id).name] = user_result[puzzle.id]
                                            delete user_result[puzzle.id]
                                        })
                                        let best_result = {}
                                        puzzles.forEach(x => best_result[x.id] = 0)

                                        if (users_puzzles) {
                                            let subs = [...new Set(users_puzzles.map(item => item.userSub))]

                                            puzzles.forEach(puzzle => {
                                                subs.forEach(sub => {
                                                    let user_puzzle = users_puzzles.find(x => x.puzzleId == puzzle.id && x.userSub == sub)

                                                    if (user_puzzle && user_puzzle.score > best_result[puzzle.id]) {
                                                        best_result[puzzle.id] = user_puzzle.score
                                                    }
                                                })
                                                best_result[puzzles.find(x => x.id == puzzle.id).name] = best_result[puzzle.id]
                                                delete best_result[puzzle.id]
                                            })
                                        }
                                        return res.json({ user: user_result, best_user: best_result })
                                    })
                                    .catch(err => console.log(err))
                            })
                    })
            })

            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};

exports.bestScoreForPuzzle = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return UserPuzzles.findOne({
            attributes: [[Sequelize.fn('max', Sequelize.col('score')), 'score']],
            where: { puzzleId: req.params.id },
            raw: true,
        })
            .then(best_score => {
                return UserPuzzles.findOne({ where: { puzzleId: req.params.id, score: best_score.score } })
                    .then(best_user => {
                        return res.json(best_user)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};