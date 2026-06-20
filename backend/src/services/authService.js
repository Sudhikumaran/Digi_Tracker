const crypto = require('crypto');
const slugify = require('slugify');
const userRepository = require('../repositories/userRepository');
const businessRepository = require('../repositories/businessRepository');
const moduleRepository = require('../repositories/moduleRepository');
const { planRepository, subscriptionRepository } = require('../repositories/firebaseRepositories');
const { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } = require('../utils/tokens');
const { seedDefaultModules } = require('../seeds/defaultModules');
const AppError = require('../utils/AppError');

class AuthService {
  async register(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email already registered', 409);

    const slug = slugify(data.businessName, { lower: true, strict: true });
    const existingBusiness = await businessRepository.findBySlug(slug);
    if (existingBusiness) throw new AppError('Business name already taken', 409);

    const business = await businessRepository.create({
      name: data.businessName,
      slug,
      type: data.businessType,
      email: data.email,
      contactNumber: data.contactNumber,
      timezone: data.timezone,
    });

    const user = await userRepository.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'business_owner',
      businessId: business._id,
    });

    const starterPlan = await planRepository.findBySlug('professional');
    if (starterPlan) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      await subscriptionRepository.create({
        businessId: business._id,
        planId: starterPlan._id,
        status: 'trial',
        trialEndsAt: trialEnd,
      });
    }

    await seedDefaultModules(business._id, user._id);

    const tokens = await this._generateTokens(user);
    return { user, business, ...tokens };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.isActive === false) throw new AppError('Invalid credentials', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    let business = null;
    if (user.businessId) {
      business = await businessRepository.findById(user.businessId);
    }

    const tokens = await this._generateTokens(user);
    return { user, business, ...tokens };
  }

  async refresh(refreshToken) {
    const stored = await userRepository.findRefreshToken(refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    await userRepository.deleteRefreshToken(refreshToken);
    const user = await userRepository.findById(stored.userId);
    if (!user || !user.isActive) throw new AppError('User not found', 401);

    return this._generateTokens(user);
  }

  async logout(refreshToken) {
    if (refreshToken) {
      await userRepository.deleteRefreshToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return { message: 'If email exists, reset link has been sent' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await userRepository.update(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 3600000),
    });

    // In production, send email with reset link
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    console.log(`Password reset URL: ${resetUrl}`);

    return { message: 'If email exists, reset link has been sent' };
  }

  async resetPassword(token, password) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);
    if (!user) throw new AppError('Invalid or expired reset token', 400);

    await userRepository.updatePassword(user._id, password);

    await userRepository.deleteAllRefreshTokens(user._id);
    return { message: 'Password reset successful' };
  }

  async _generateTokens(user) {
    const payload = {
      userId: user._id,
      role: user.role,
      businessId: user.businessId?.toString() || null,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    await userRepository.saveRefreshToken(user._id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
