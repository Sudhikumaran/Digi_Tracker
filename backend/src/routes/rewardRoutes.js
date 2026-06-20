const { Router } = require('express');
const rewardController = require('../controllers/rewardController');
const { authenticate, tenantScope } = require('../middleware/auth');

const router = Router();

router.use(authenticate, tenantScope);

router.get('/leaderboard', rewardController.getLeaderboard);
router.get('/me', rewardController.getMyRewards);

module.exports = router;
