const { asyncHandler, sendSuccess } = require('../utils/helpers');
const { notificationService } = require('../services');

const listNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.list(req.businessId, req.user._id, req.query);
  sendSuccess(res, data);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.businessId, req.user._id, req.params.id);
  sendSuccess(res, notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.businessId, req.user._id);
  sendSuccess(res, result);
});

module.exports = { listNotifications, markAsRead, markAllAsRead };
