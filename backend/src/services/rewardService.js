const { rewardRepository } = require('../repositories/firebaseRepositories');
const userRepository = require('../repositories/userRepository');
const config = require('../config');
const { startOfDay } = require('../utils/dateUtils');

class RewardService {
  async processDailyEntry(businessId, userId) {
    const user = await userRepository.findById(userId);
    const today = startOfDay(new Date());
    const lastEntry = user.lastEntryDate ? startOfDay(user.lastEntryDate) : null;

    let newStreak = 1;
    if (lastEntry) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastEntry.getTime() === yesterday.getTime()) {
        newStreak = user.currentStreak + 1;
      } else if (lastEntry.getTime() === today.getTime()) {
        newStreak = user.currentStreak;
      }
    }

    const points = config.rewards.dailyEntry;
    await rewardRepository.create({
      businessId,
      userId,
      type: 'daily_entry',
      points,
      description: 'Daily entry submission',
      period: today.toISOString().split('T')[0],
    });

    let bonusPoints = 0;
    if (newStreak === 7) {
      bonusPoints = config.rewards.streakBonus7;
      await rewardRepository.create({
        businessId, userId, type: 'streak_bonus', points: bonusPoints,
        description: '7-day streak bonus!', period: `streak-7-${today.toISOString().split('T')[0]}`,
      });
      const notificationService = require('./notificationService');
      await notificationService.sendRewardAchievement(businessId, userId, '7-day streak! +50 bonus points');
    } else if (newStreak === 30) {
      bonusPoints = config.rewards.streakBonus30;
      await rewardRepository.create({
        businessId, userId, type: 'streak_bonus', points: bonusPoints,
        description: '30-day streak bonus!', period: `streak-30-${today.toISOString().split('T')[0]}`,
      });
      const notificationService = require('./notificationService');
      await notificationService.sendRewardAchievement(businessId, userId, '30-day streak! +200 bonus points');
    }

    await userRepository.update(userId, {
      rewardPoints: (user.rewardPoints || 0) + points + bonusPoints,
      currentStreak: newStreak,
      longestStreak: Math.max(user.longestStreak || 0, newStreak),
      lastEntryDate: today,
    });
  }

  async processAccuracyBonus(businessId, userId) {
    const points = config.rewards.accuracyBonus;
    await rewardRepository.create({
      businessId, userId, type: 'accuracy', points,
      description: 'Entry accuracy bonus', period: new Date().toISOString().split('T')[0],
    });

    const user = await userRepository.findById(userId);
    await userRepository.update(userId, { rewardPoints: (user.rewardPoints || 0) + points });
  }

  async getLeaderboard(businessId, period = 'all') {
    let rewards = await rewardRepository.findByBusiness(businessId);
    const now = new Date();

    if (period === 'weekly') {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      rewards = rewards.filter((r) => new Date(r.createdAt) >= start);
    } else if (period === 'monthly') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      rewards = rewards.filter((r) => new Date(r.createdAt) >= start);
    } else if (period === 'quarterly') {
      const start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      rewards = rewards.filter((r) => new Date(r.createdAt) >= start);
    }

    const pointsByUser = new Map();
    for (const r of rewards) {
      const uid = String(r.userId);
      pointsByUser.set(uid, (pointsByUser.get(uid) || 0) + (r.points || 0));
    }

    const sorted = [...pointsByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50);
    const users = await userRepository.findByIds(sorted.map(([id]) => id));
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const leaderboard = sorted.map(([userId, pts], index) => {
      const user = userMap.get(userId);
      return {
        rank: index + 1,
        userId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        points: period === 'all' ? (user?.rewardPoints || pts) : pts,
        streak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
      };
    });

    return { leaderboard, period };
  }

  async getMyRewards(businessId, userId) {
    const user = await userRepository.findById(userId);
    const recentRewards = await rewardRepository.findByUser(businessId, userId, 20);

    return {
      totalPoints: user?.rewardPoints || 0,
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      recentRewards,
    };
  }
}

module.exports = new RewardService();
