const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      required: true,
    },
    period: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    format: { type: String, enum: ['pdf', 'excel', 'csv'], required: true },
    fileUrl: { type: String, default: null },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

reportSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
