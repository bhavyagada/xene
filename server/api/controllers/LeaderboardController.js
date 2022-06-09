const { User, Challenge, Puzzle, UserPuzzles } = require('../../sequelize')
const { fetchUsersFromAuth0 } = require('./UserController')

exports.getChallenge = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        return Challenge.findByPk(req.params.id)
            .then(challenge => {
                return challenge.getPuzzles({ attributes: ['id', 'name'] })
                    .then(puzzles => {
                        return UserPuzzles.findAll({ where: { puzzleId: puzzles.map(puzzle => puzzle.id) }, raw: true })
                            .then(user_puzzles => {
                                let result = []

                                user_puzzles.forEach(user_puzzle => {
                                    let index = result.findIndex(res => res.sub == user_puzzle.userSub)
                                    let puzzle = puzzles.find(puzzle => puzzle.id == user_puzzle.puzzleId)
                                    if (index >= 0) {
                                        result[index].avg_score += Math.round(user_puzzle.score / puzzles.length)
                                        result[index].puzzles.push({ id: puzzle.id, name: puzzle.name, score: user_puzzle.score })
                                    } else {
                                        result.push({ sub: user_puzzle.userSub, avg_score: Math.round(user_puzzle.score / puzzles.length), puzzles: [{ id: puzzle.id, name: puzzle.name, score: user_puzzle.score }] })
                                    }
                                })

                                result = result.sort((a, b) => b.avg_score - a.avg_score).slice(0, 50)

                                return fetchUsersFromAuth0(result.map(x => x.sub))
                                    .then(users => {
                                        return res.json({ users, result })
                                    })
                                    .catch(err => console.error(err))
                            })
                            .catch(err => console.error(err))
                    })
                    .catch(err => console.error(err))
            })
    } else {
        res.json('Guest User')
    }
};

function getUsersForPuzzle(id) {
    return Puzzle.findByPk(id)
        .then(puzzle => {
            return puzzle.getUsers()
                .then(users => {
                    let formatted_users = []
                    users.forEach(user => {
                        formatted_users.push({
                            sub: user.UserPuzzles.userSub,
                            time: user.UserPuzzles.time,
                            edits: user.UserPuzzles.edits,
                            conciseness: user.UserPuzzles.conciseness,
                            complexity: user.UserPuzzles.complexity,
                            score: user.UserPuzzles.score,
                        })
                    })

                    return formatted_users.sort((a, b) => b.score - a.score).slice(0, 50)
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}

exports.getPuzzle = function (req, res) {
    let token = req.cookies['auth._token.auth0']
    if (token) {
        getUsersForPuzzle(req.params.id)
            .then(result => {
                return fetchUsersFromAuth0(result.map(x => x.sub))
                    .then(users => {
                        return res.json({ users, result })
                    })
                    .catch(err => console.error(err))
            })
            .catch(err => console.log(err))
    } else {
        res.json('Guest User')
    }
};