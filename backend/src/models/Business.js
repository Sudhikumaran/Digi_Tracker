const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
      type: String,
      required: true,
      enum: [
        'gym', 'fitness_center', 'restaurant', 'real_estate',
        'digital_marketing', 'coaching', 'salon', 'clinic',
        'retail', 'other',
      ],
    },
    logo: { type: String, default: null },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    contactNumber: { type: String, default: null },
    email: { type: String, required: true, lowercase: true },
    timezone: { type: String, default: 'UTC' },
    branding: {
      primaryColor: { type: String, default: '#6366F1' },
      secondaryColor: { type: String, default: '#8B5CF6' },
      logoUrl: { type: String, default: null },
    },
    settings: {
      entryReminderTime: { type: String, default: '09:00' },
      weekStartsOn: { type: Number, default: 1 },
      currency: { type: String, default: 'USD' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
    },
    branches: [{
      name: String,
      address: String,
      isActive: { type: Boolean, default: true },
    }],
    isActive: { type: Boolean, default: true },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

businessSchema.index({ email: 1 });

module.exports = mongoose.model('Business', businessSchema);
