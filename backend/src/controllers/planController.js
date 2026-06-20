const { asyncHandler, sendSuccess } = require('../utils/helpers');
const { planService } = require('../services');

const listPlans = asyncHandler(async (req, res) => {
  const plans = await planService.listPlans();
  sendSuccess(res, plans);
});

const createPlan = asyncHandler(async (req, res) => {
  const plan = await planService.createPlan(req.body);
  sendSuccess(res, plan, 'Plan created', 201);
});

const listSubscriptions = asyncHandler(async (req, res) => {
  const data = await planService.listSubscriptions(req.query);
  sendSuccess(res, data);
});

const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await planService.updateSubscription(req.params.businessId, req.body);
  sendSuccess(res, subscription, 'Subscription updated');
});

module.exports = { listPlans, createPlan, listSubscriptions, updateSubscription };
