const { asyncHandler, sendSuccess, sendPaginated } = require('../utils/helpers');
const auditLogService = require('../services/auditLogService');

const listAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditLogService.list(req.businessId, req.query);
  sendPaginated(res, result.logs, {
    total: result.total, page: result.page, limit: result.limit, pages: result.pages,
  });
});

module.exports = { listAuditLogs };
