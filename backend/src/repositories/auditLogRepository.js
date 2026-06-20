const store = require('../db/firestoreStore');
const { COLLECTIONS } = store;
const userRepository = require('./userRepository');

class AuditLogRepository {
  async findByBusiness(businessId, filters = {}, page = 1, limit = 20) {
    const merged = { businessId: String(businessId), ...filters };
    const result = await store.find(COLLECTIONS.auditLogs, merged, page, limit);
    const logs = await Promise.all(result.docs.map(async (log) => {
      const user = await userRepository.findById(log.userId);
      const entry = await store.findById(COLLECTIONS.entries, log.entryId);
      return {
        ...log,
        userId: user ? { _id: user._id, firstName: user.firstName, lastName: user.lastName } : log.userId,
        entryId: entry ? { _id: entry._id, entryDate: entry.entryDate } : log.entryId,
      };
    }));
    return { logs, total: result.total, page: result.page, limit: result.limit, pages: result.pages };
  }

  async create(data) {
    return store.create(COLLECTIONS.auditLogs, {
      ...data,
      businessId: String(data.businessId),
      entryId: String(data.entryId),
      userId: String(data.userId),
    });
  }
}

module.exports = new AuditLogRepository();
