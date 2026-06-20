const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['entry_reminder', 'weekly_analytics', 'monthly_report', 'reward_achievement', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ businessId: 1, userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
