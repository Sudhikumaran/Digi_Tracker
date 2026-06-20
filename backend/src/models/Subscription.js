const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trial'],
      default: 'trial',
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    trialEndsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

subscriptionSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
