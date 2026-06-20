const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    interval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    features: {
      maxStaff: { type: Number, default: 5 },
      maxModules: { type: Number, default: 10 },
      maxBranches: { type: Number, default: 1 },
      analytics: { type: Boolean, default: true },
      reports: { type: Boolean, default: false },
      customModules: { type: Boolean, default: false },
      rewards: { type: Boolean, default: true },
      whiteLabel: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
