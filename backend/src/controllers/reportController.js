const path = require('path');
const { asyncHandler, sendSuccess, sendPaginated } = require('../utils/helpers');
const { reportService } = require('../services');

const generateReport = asyncHandler(async (req, res) => {
  const report = await reportService.generate(req.businessId, req.user._id, req.body);
  sendSuccess(res, report, 'Report generation started', 201);
});

const listReports = asyncHandler(async (req, res) => {
  const result = await reportService.list(req.businessId, req.query.page, req.query.limit);
  sendPaginated(res, result.reports, {
    total: result.total, page: result.page, limit: result.limit, pages: result.pages,
  });
});

const downloadReport = asyncHandler(async (req, res) => {
  const { filePath, format } = await reportService.getDownloadPath(req.businessId, req.params.id);
  const mimeTypes = { pdf: 'application/pdf', excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', csv: 'text/csv' };
  res.download(filePath, `report.${format === 'excel' ? 'xlsx' : format}`, {
    headers: { 'Content-Type': mimeTypes[format] },
  });
});

module.exports = { generateReport, listReports, downloadReport };
