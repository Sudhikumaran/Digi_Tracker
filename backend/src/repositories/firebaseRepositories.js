const store = require('../db/firestoreStore');
const { COLLECTIONS } = store;

class PlanRepository {
  async findAll(filters = {}) {
    return store.findAll(COLLECTIONS.plans, { isActive: true, ...filters }, { sortField: 'price', sortDir: 'asc' });
  }

  async findById(id) {
    return store.findById(COLLECTIONS.plans, id);
  }

  async findBySlug(slug) {
    return store.findOne(COLLECTIONS.plans, { slug });
  }

  async create(data) {
    return store.create(COLLECTIONS.plans, { ...data, isActive: data.isActive !== false });
  }
}

class SubscriptionRepository {
  async findByBusiness(businessId) {
    return store.findOne(COLLECTIONS.subscriptions, { businessId: String(businessId) });
  }

  async findAll(filters = {}, page = 1, limit = 20) {
    const result = await store.find(COLLECTIONS.subscriptions, filters, page, limit);
    const subscriptions = await Promise.all(result.docs.map(async (sub) => {
      const business = await store.findById(COLLECTIONS.businesses, sub.businessId);
      const plan = await store.findById(COLLECTIONS.plans, sub.planId);
      return { ...sub, businessId: business || sub.businessId, planId: plan || sub.planId };
    }));
    return { subscriptions, total: result.total, page: result.page, limit: result.limit, pages: result.pages };
  }

  async create(data) {
    return store.create(COLLECTIONS.subscriptions, {
      ...data,
      businessId: String(data.businessId),
      planId: String(data.planId),
    });
  }

  async upsert(businessId, data) {
    const existing = await this.findByBusiness(businessId);
    if (existing) {
      return store.updateById(COLLECTIONS.subscriptions, existing._id, data);
    }
    return store.create(COLLECTIONS.subscriptions, { businessId: String(businessId), ...data });
  }

  async update(businessId, data) {
    return this.upsert(businessId, data);
  }
}

class RewardRepository {
  async create(data) {
    return store.create(COLLECTIONS.rewards, {
      ...data,
      businessId: String(data.businessId),
      userId: String(data.userId),
    });
  }

  async findByUser(businessId, userId, limit = 20) {
    return store.findAll(COLLECTIONS.rewards, {
      businessId: String(businessId),
      userId: String(userId),
    }).then((rows) => rows.slice(0, limit));
  }

  async findByBusiness(businessId, filters = {}) {
    return store.findAll(COLLECTIONS.rewards, { businessId: String(businessId), ...filters });
  }
}

class NotificationRepository {
  async find(businessId, userId, filters = {}, page = 1, limit = 20) {
    const merged = { businessId: String(businessId), userId: String(userId), ...filters };
    const result = await store.find(COLLECTIONS.notifications, merged, page, limit);
    const unreadCount = await store.count(COLLECTIONS.notifications, {
      businessId: String(businessId),
      userId: String(userId),
      isRead: false,
    });
    return { notifications: result.docs, total: result.total, unreadCount, page: result.page, limit: result.limit };
  }

  async findById(id) {
    return store.findById(COLLECTIONS.notifications, id);
  }

  async create(data) {
    return store.create(COLLECTIONS.notifications, {
      ...data,
      businessId: String(data.businessId),
      userId: String(data.userId),
      isRead: false,
    });
  }

  async update(id, data) {
    return store.updateById(COLLECTIONS.notifications, id, data);
  }

  async markAllRead(businessId, userId) {
    const rows = await store.findAll(COLLECTIONS.notifications, {
      businessId: String(businessId),
      userId: String(userId),
      isRead: false,
    });
    await Promise.all(rows.map((r) => store.updateById(COLLECTIONS.notifications, r._id, { isRead: true })));
  }
}

class ReportRepository {
  async create(data) {
    return store.create(COLLECTIONS.reports, {
      ...data,
      businessId: String(data.businessId),
      generatedBy: String(data.generatedBy),
      status: data.status || 'pending',
    });
  }

  async findById(id) {
    return store.findById(COLLECTIONS.reports, id);
  }

  async update(id, data) {
    return store.updateById(COLLECTIONS.reports, id, data);
  }

  async findByBusiness(businessId, page = 1, limit = 20) {
    const result = await store.find(COLLECTIONS.reports, { businessId: String(businessId) }, page, limit);
    return { reports: result.docs, total: result.total, page: result.page, limit: result.limit, pages: result.pages };
  }
}

module.exports = {
  planRepository: new PlanRepository(),
  subscriptionRepository: new SubscriptionRepository(),
  rewardRepository: new RewardRepository(),
  notificationRepository: new NotificationRepository(),
  reportRepository: new ReportRepository(),
};
