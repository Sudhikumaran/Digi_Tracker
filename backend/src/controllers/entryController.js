const { asyncHandler, sendSuccess, sendPaginated } = require('../utils/helpers');
const { entryService } = require('../services');

const listEntries = asyncHandler(async (req, res) => {
  const result = await entryService.list(req.businessId, req.query);
  sendPaginated(res, result.entries, {
    total: result.total, page: result.page, limit: result.limit, pages: result.pages,
  });
});

const getEntry = asyncHandler(async (req, res) => {
  const entry = await entryService.getById(req.businessId, req.params.id);
  sendSuccess(res, entry);
});

const createEntry = asyncHandler(async (req, res) => {
  const entry = await entryService.create(
    req.businessId, req.user._id, req.body, req.ip
  );
  sendSuccess(res, entry, 'Entry submitted', 201);
});

const updateEntry = asyncHandler(async (req, res) => {
  const entry = await entryService.update(
    req.businessId, req.params.id, req.user._id, req.body, req.ip, req.user.role
  );
  sendSuccess(res, entry, 'Entry updated');
});

const getMyHistory = asyncHandler(async (req, res) => {
  const result = await entryService.getMyHistory(req.businessId, req.user._id, req.query);
  sendPaginated(res, result.entries, {
    total: result.total, page: result.page, limit: result.limit, pages: result.pages,
  });
});

const getTodayStatus = asyncHandler(async (req, res) => {
  const data = await entryService.getTodayStatus(req.businessId, req.user._id);
  sendSuccess(res, data);
});

module.exports = { listEntries, getEntry, createEntry, updateEntry, getMyHistory, getTodayStatus };
