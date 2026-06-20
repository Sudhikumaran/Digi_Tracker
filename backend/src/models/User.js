const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['super_admin', 'business_owner', 'staff'],
      required: true,
    },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    rewardPoints: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastEntryDate: { type: Date, default: null },
    fcmToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ businessId: 1, role: 1 });
userSchema.index({ businessId: 1, isActive: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
