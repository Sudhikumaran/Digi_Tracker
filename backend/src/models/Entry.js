const mongoose = require('mongoose');

const entryValueSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fieldSlug: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

const entrySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    entryDate: { type: Date, required: true },
    values: [entryValueSchema],
    notes: { type: String, default: '' },
    isEdited: { type: Boolean, default: false },
    editCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

entrySchema.index({ businessId: 1, moduleId: 1, entryDate: -1 });
entrySchema.index({ businessId: 1, userId: 1, entryDate: -1 });
entrySchema.index(
  { businessId: 1, moduleId: 1, entryDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('Entry', entrySchema);
