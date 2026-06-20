const { notificationRepository } = require('../repositories/firebaseRepositories');
const AppError = require('../utils/AppError');
const fcmService = require('./fcmService');

class NotificationService {
  async list(businessId, userId, query = {}) {
    const { page = 1, limit = 20, isRead } = query;
    const filters = {};
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    return notificationRepository.find(businessId, userId, filters, parseInt(page), parseInt(limit));
  }

  async markAsRead(businessId, userId, notificationId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification || notification.businessId !== String(businessId) || notification.userId !== String(userId)) {
      throw new AppError('Notification not found', 404);
    }
    return notificationRepository.update(notificationId, { isRead: true });
  }

  async markAllAsRead(businessId, userId) {
    await notificationRepository.markAllRead(businessId, userId);
    return { message: 'All notifications marked as read' };
  }

  async create(businessId, userId, type, title, body, data = {}) {
    const notification = await notificationRepository.create({ businessId, userId, type, title, body, data });

    fcmService.sendToUser(userId, {
      title,
      body,
      data: { type, notificationId: notification._id, ...data },
    }).catch(() => {});

    return notification;
  }

  async sendEntryReminder(businessId, userId) {
    return this.create(
      businessId, userId, 'entry_reminder',
      'Daily Entry Reminder',
      "Don't forget to submit today's business metrics!",
    );
  }

  async sendRewardAchievement(businessId, userId, description) {
    return this.create(
      businessId, userId, 'reward_achievement',
      'Reward Achievement!',
      description,
    );
  }
}

module.exports = new NotificationService();
