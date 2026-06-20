const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['daily_entry', 'streak_bonus', 'weekly_champion', 'monthly_champion', 'quarterly_champion', 'accuracy'],
      required: true,
    },
    points: { type: Number, required: true },
    description: { type: String, default: '' },
    period: { type: String, default: null },
  },
  { timestamps: true }
);

rewardSchema.index({ businessId: 1, userId: 1 });
rewardSchema.index({ businessId: 1, period: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
