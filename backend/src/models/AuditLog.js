const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entry', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['create', 'update', 'delete'], required: true },
    previousValues: { type: mongoose.Schema.Types.Mixed, default: null },
    newValues: { type: mongoose.Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true }
);

auditLogSchema.index({ businessId: 1, entryId: 1 });
auditLogSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
