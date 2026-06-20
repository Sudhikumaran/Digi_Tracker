const { asyncHandler, sendSuccess } = require('../utils/helpers');
const { rewardService } = require('../services');

const getLeaderboard = asyncHandler(async (req, res) => {
  const data = await rewardService.getLeaderboard(req.businessId, req.query.period);
  sendSuccess(res, data);
});

const getMyRewards = asyncHandler(async (req, res) => {
  const data = await rewardService.getMyRewards(req.businessId, req.user._id);
  sendSuccess(res, data);
});

module.exports = { getLeaderboard, getMyRewards };
