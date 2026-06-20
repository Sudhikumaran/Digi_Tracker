const auditLogRepository = require('../repositories/auditLogRepository');

class AuditLogService {
  async list(businessId, query = {}) {
    const { page = 1, limit = 20, entryId, userId } = query;
    const filters = {};
    if (entryId) filters.entryId = entryId;
    if (userId) filters.userId = userId;
    return auditLogRepository.findByBusiness(businessId, filters, parseInt(page), parseInt(limit));
  }
}

module.exports = new AuditLogService();
