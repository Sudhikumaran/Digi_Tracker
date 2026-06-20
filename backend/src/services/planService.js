const { planRepository, subscriptionRepository } = require('../repositories/firebaseRepositories');
const AppError = require('../utils/AppError');

class PlanService {
  async listPlans() {
    return planRepository.findAll();
  }

  async createPlan(data) {
    return planRepository.create(data);
  }

  async listSubscriptions(query = {}) {
    const { page = 1, limit = 20, status } = query;
    const filters = {};
    if (status) filters.status = status;
    return subscriptionRepository.findAll(filters, parseInt(page), parseInt(limit));
  }

  async updateSubscription(businessId, data) {
    const update = { ...data };
    if (data.planId) {
      const plan = await planRepository.findById(data.planId);
      if (!plan) throw new AppError('Plan not found', 404);
      update.planId = plan._id;
    }
    if (data.status === 'active' && !update.startDate) {
      update.startDate = new Date();
    }
    const subscription = await subscriptionRepository.upsert(businessId, update);
    const plan = await planRepository.findById(subscription.planId);
    return { ...subscription, planId: plan || subscription.planId };
  }
}

module.exports = new PlanService();
