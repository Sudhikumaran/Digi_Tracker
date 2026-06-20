const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true },
  type: {
    type: String,
    enum: ['number', 'text', 'date', 'dropdown', 'boolean', 'currency', 'percentage'],
    required: true,
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  defaultValue: { type: mongoose.Schema.Types.Mixed, default: null },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const moduleSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'chart-bar' },
    color: { type: String, default: '#6366F1' },
    fields: [fieldSchema],
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    source: { type: String, enum: ['manual', 'api'], default: 'manual' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

moduleSchema.index({ businessId: 1, slug: 1 }, { unique: true });
moduleSchema.index({ businessId: 1, isActive: 1 });

module.exports = mongoose.model('Module', moduleSchema);
