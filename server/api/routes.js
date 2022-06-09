import express from 'express'

// Create express router
const router = express.Router()

// Transform req & res to have the same API as express
// So we can use res.status() & res.json()
const app = express()

router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

const UserController = require('./controllers/UserController');
const ChallengeController = require('./controllers/ChallengeController');
const PuzzleController = require('./controllers/PuzzleController');
const UserPuzzlesController = require('./controllers/UserPuzzlesController');
const LeaderboardController = require('./controllers/LeaderboardController');
const AnalyticsController = require('./controllers/AnalyticsController');

router.route('/challenges').get(ChallengeController.getChallenges);
// router.route('/challenges/:id').get(ChallengeController.getChallenge);
// router.route('/challenges/:id/puzzles').get(ChallengeController.getPuzzles);

router.route('/puzzles').get(PuzzleController.getPuzzles);
// router.route('/puzzles/:id').get(PuzzleController.getPuzzle);
// router.route('/puzzles/:id/challenge').get(PuzzleController.getChallenge);
router.route('/puzzles/:id/interpret').post(PuzzleController.interpretCode)

router.route('/user').get((UserController.getLoggedInUser));
router.route('/user').post(UserController.setLoggedInUser);
// router.route('/user/distinct').get(UserController.getDistinctUsers);

router.route('/user/puzzles').get(UserPuzzlesController.getUserPuzzlesForChallenge);
router.route('/user/disabled_keys').get(UserPuzzlesController.getDisabledKeys);
router.route('/user/challenges/:id').get(UserPuzzlesController.getUserPuzzlesForChallenge);
router.route('/user/puzzles/:id').get(UserPuzzlesController.getPuzzle);
router.route('/user/puzzles/:id').post(UserPuzzlesController.savePuzzle);

router.route('/leaderboard/challenges/:id').get(LeaderboardController.getChallenge);
router.route('/leaderboard/puzzles/:id').get(LeaderboardController.getPuzzle);

router.route('/analytics/user/challenges/:id').get(AnalyticsController.fetchUserPuzzlesForChallenge);
router.route('/analytics/challenges/:id').get(AnalyticsController.fetchPuzzlesForChallenge);
router.route('/analytics/challenges/:id/user_counts').get(AnalyticsController.userCountsForChallenge);
router.route('/analytics/challenges/:id/average_scores').get(AnalyticsController.averageScoresForChallenge);
router.route('/analytics/challenges/:id/sum_scores').get(AnalyticsController.sumScoresForChallenge);
router.route('/analytics/challenges/:id/best_score').get(AnalyticsController.bestScoreForChallenge);
router.route('/analytics/challenges/:id/puzzles_best_score').get(AnalyticsController.bestPuzzlesScoreForChallenge);

router.route('/analytics/puzzles/:id').get(AnalyticsController.fetchPuzzle);
router.route('/analytics/puzzles/:id/best_score').get(AnalyticsController.bestScoreForPuzzle);
router.route('/analytics/puzzles/:id/user_counts').get(AnalyticsController.userCountsForPuzzle);

module.exports = router