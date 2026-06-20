const { subscriptionRepository, planRepository } = require('../repositories/firebaseRepositories');
const AppError = require('../utils/AppError');

async function requireActiveSubscription(req, res, next) {
  if (req.user?.role === 'super_admin') return next();
  if (!req.businessId) return next();

  const sub = await subscriptionRepository.findByBusiness(req.businessId);
  if (!sub) return next();

  if (sub.status === 'trial' && sub.trialEndsAt && new Date(sub.trialEndsAt) < new Date()) {
    return next(new AppError('Your trial has expired. Please upgrade your subscription.', 402));
  }

  if (!['active', 'trial'].includes(sub.status)) {
    return next(new AppError('Subscription inactive. Please contact support to restore access.', 402));
  }

  next();
}

module.exports = { requireActiveSubscription };
