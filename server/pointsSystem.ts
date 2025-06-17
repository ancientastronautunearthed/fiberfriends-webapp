// server/pointsSystem.ts
import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";
import { UserBadge } from "@shared/schema";

// Point values for different activities
export const POINT_VALUES = {
  // Daily Health Tracking (Core Features)
  SYMPTOM_LOG_ENTRY: 15,
  FOOD_LOG_ENTRY: 10,
  SYMPTOM_WHEEL_ENTRY: 20,
  DAILY_LOG_COMPLETE: 25,
  
  // AI Companion Engagement
  AI_CONVERSATION_MESSAGE: 5,
  AI_CONVERSATION_SESSION: 15, // 10+ messages in one session
  VOICE_INTERACTION: 10,
  
  // Community Participation
  COMMUNITY_POST_CREATE: 20,
  COMMUNITY_POST_REPLY: 10,
  COMMUNITY_POST_LIKE: 2,
  COMMUNITY_POST_SHARE: 5,
  HELPFUL_REPLY_RECEIVED: 15, // When someone marks your reply as helpful
  
  // Challenges & Gamification
  CHALLENGE_COMPLETE: 50,
  CHALLENGE_CREATE: 30,
  WEEKLY_CHALLENGE_COMPLETE: 100,
  MILESTONE_ACHIEVEMENT: 75,
  
  // Learning & Discovery
  PATTERN_DISCOVERY: 25,
  CORRELATION_FOUND: 30,
  INSIGHT_GENERATED: 20,
  
  // Consistency & Streaks
  DAILY_STREAK_BONUS: 10, // Per day in streak
  WEEKLY_GOAL_COMPLETE: 75,
  MONTHLY_MILESTONE: 150,
  
  // Special Activities
  PROFILE_COMPLETION: 50,
  ONBOARDING_COMPLETE: 100,
  FIRST_TIME_BONUS: 25, // First time doing any activity
  WEEKEND_BONUS: 5, // Extra points for weekend activities
  BIRTHDAY_BONUS: 100, // Double points on user's birthday
  
  // Referral & Social
  REFERRAL_SIGNUP: 200,
  HELP_NEWCOMER: 30,
  MENTOR_ACTIVITY: 25,
};

// Tier definitions with point thresholds
export const TIERS = {
  NEWCOMER: { min: 0, max: 99, badge: "🌱", color: "#94a3b8" },
  EXPLORER: { min: 100, max: 299, badge: "🔍", color: "#06b6d4" },
  ADVOCATE: { min: 300, max: 699, badge: "💪", color: "#10b981" },
  CHAMPION: { min: 700, max: 1499, badge: "🏆", color: "#f59e0b" },
  GUARDIAN: { min: 1500, max: Infinity, badge: "👑", color: "#ef4444" },
};

// Badge definitions
export const BADGES = {
  // Milestone badges
  FIRST_LOG: { id: 'first_log', name: 'First Steps', description: 'Logged your first symptom or food entry', icon: '🎯' },
  WEEK_STREAK: { id: 'week_streak', name: 'Week Warrior', description: 'Maintained a 7-day logging streak', icon: '🔥' },
  MONTH_STREAK: { id: 'month_streak', name: 'Monthly Master', description: 'Maintained a 30-day logging streak', icon: '🌟' },
  HUNDRED_LOGS: { id: 'hundred_logs', name: 'Century Logger', description: 'Created 100 total logs', icon: '💯' },
  
  // Activity badges
  CONVERSATION_STARTER: { id: 'conversation_starter', name: 'Conversation Starter', description: 'Had your first AI companion chat', icon: '💬' },
  COMMUNITY_CONTRIBUTOR: { id: 'community_contributor', name: 'Community Contributor', description: 'Made 10 community posts', icon: '🤝' },
  HELPER_BEE: { id: 'helper_bee', name: 'Helper Bee', description: 'Received 5 helpful reply badges', icon: '🐝' },
  PATTERN_DETECTIVE: { id: 'pattern_detective', name: 'Pattern Detective', description: 'Discovered 5 symptom patterns', icon: '🔍' },
  
  // Challenge badges
  CHALLENGE_ACCEPTED: { id: 'challenge_accepted', name: 'Challenge Accepted', description: 'Completed your first challenge', icon: '🎪' },
  CHALLENGE_CHAMPION: { id: 'challenge_champion', name: 'Challenge Champion', description: 'Won a weekly challenge', icon: '🥇' },
  CHALLENGER: { id: 'challenger', name: 'Challenger', description: 'Completed 10 challenges', icon: '⚔️' },
  
  // Tier badges
  EXPLORER_TIER: { id: 'explorer_tier', name: 'Explorer', description: 'Reached Explorer tier', icon: '🔍' },
  ADVOCATE_TIER: { id: 'advocate_tier', name: 'Advocate', description: 'Reached Advocate tier', icon: '💪' },
  CHAMPION_TIER: { id: 'champion_tier', name: 'Champion', description: 'Reached Champion tier', icon: '🏆' },
  GUARDIAN_TIER: { id: 'guardian_tier', name: 'Guardian', description: 'Reached Guardian tier', icon: '👑' },
  
  // Special badges
  EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', description: 'Logged before 6 AM', icon: '🌅' },
  NIGHT_OWL: { id: 'night_owl', name: 'Night Owl', description: 'Logged after midnight', icon: '🦉' },
  WEEKEND_WARRIOR: { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Logged every weekend for a month', icon: '🗓️' },
  DATA_SCIENTIST: { id: 'data_scientist', name: 'Data Scientist', description: 'Analyzed 30 days of your data', icon: '📊' },
};

class PointsSystem {
  // Check if it's the first time doing this activity
  private async isFirstTimeActivity(userId: string, activityType: string): Promise<boolean> {
    const previousActivities = await storage.getPointActivitiesByType(userId, activityType);
    return previousActivities.length === 0;
  }

  // Award points for an activity
  async awardPoints(
    userId: string,
    activityType: keyof typeof POINT_VALUES,
    metadata?: any
  ): Promise<number> {
    const basePoints = POINT_VALUES[activityType];
    if (!basePoints) {
      console.error(`Unknown activity type: ${activityType}`);
      return 0;
    }

    const user = await storage.getUser(userId);
    if (!user) return 0;

    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    
    const isFirstTime = await this.isFirstTimeActivity(userId, activityType);

    let totalPoints = basePoints;
    if (isWeekend) totalPoints += POINT_VALUES.WEEKEND_BONUS;
    if (isFirstTime) totalPoints += POINT_VALUES.FIRST_TIME_BONUS;
    
    if (user.streakDays && user.streakDays > 0) {
      totalPoints += Math.min(user.streakDays * POINT_VALUES.DAILY_STREAK_BONUS, 100);
    }

    await storage.recordPointActivity({
      userId,
      points: totalPoints,
      type: activityType,
      description: this.getActivityDescription(activityType, metadata),
      createdAt: new Date(),
      metadata: {
        basePoints,
        bonuses: {
          weekend: isWeekend ? POINT_VALUES.WEEKEND_BONUS : 0,
          firstTime: isFirstTime ? POINT_VALUES.FIRST_TIME_BONUS : 0,
          streak: user?.streakDays ? Math.min(user.streakDays * POINT_VALUES.DAILY_STREAK_BONUS, 100) : 0
        }
      }
    });

    await this.updateUserPoints(userId, totalPoints);
    
    await this.checkBadgeUnlocks(userId, activityType, metadata);
    
    return totalPoints;
  }

  private async updateUserPoints(userId: string, pointsToAdd: number): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;

    const newTotalPoints = (user.totalPoints || 0) + pointsToAdd;
    
    const newTier = this.calculateTier(newTotalPoints);

    await storage.updateUser(userId, {
      totalPoints: newTotalPoints,
      currentTier: newTier,
    });

    if (user.currentTier !== newTier) {
      await this.awardTierBadge(userId, newTier);
    }
  }

  private calculateTier(totalPoints: number): string {
    for (const [tierName, tierData] of Object.entries(TIERS)) {
      if (totalPoints >= tierData.min && totalPoints <= tierData.max) {
        return tierName;
      }
    }
    return "NEWCOMER";
  }

  private getNextTierThreshold(currentPoints: number): number {
    const tierEntries = Object.entries(TIERS);
    for (let i = 0; i < tierEntries.length; i++) {
      const [, tierData] = tierEntries[i];
      if (currentPoints >= tierData.min && currentPoints <= tierData.max) {
        const nextTier = tierEntries[i + 1];
        return nextTier ? nextTier[1].min : tierData.max;
      }
    }
    return TIERS.GUARDIAN.max;
  }

  private async awardTierBadge(userId: string, tier: string): Promise<void> {
    const tierBadgeMap: Record<string, string> = {
      EXPLORER: 'explorer_tier',
      ADVOCATE: 'advocate_tier',
      CHAMPION: 'champion_tier',
      GUARDIAN: 'guardian_tier',
    };

    const badgeId = tierBadgeMap[tier];
    if (badgeId) {
      await this.awardBadge(userId, badgeId);
    }
  }
  
  private async checkBadgeUnlocks(
    userId: string,
    activityType: string,
    metadata?: any
  ): Promise<void> {
    if (activityType === 'SYMPTOM_LOG_ENTRY' || activityType === 'FOOD_LOG_ENTRY') {
      const totalLogs = (await storage.getActivityCount(userId, 'SYMPTOM_LOG_ENTRY')) +
                       (await storage.getActivityCount(userId, 'FOOD_LOG_ENTRY'));
      
      if (totalLogs === 1) await this.awardBadge(userId, 'first_log');
      else if (totalLogs === 100) await this.awardBadge(userId, 'hundred_logs');
    }

    if (activityType === 'AI_CONVERSATION_MESSAGE') {
      if ((await storage.getActivityCount(userId, 'AI_CONVERSATION_MESSAGE')) === 1) {
        await this.awardBadge(userId, 'conversation_starter');
      }
    }

    if (activityType === 'COMMUNITY_POST_CREATE') {
      if ((await storage.getActivityCount(userId, 'COMMUNITY_POST_CREATE')) === 10) {
        await this.awardBadge(userId, 'community_contributor');
      }
    }

    if (activityType === 'CHALLENGE_COMPLETE') {
      const challenges = await storage.getActivityCount(userId, 'CHALLENGE_COMPLETE');
      if (challenges === 1) await this.awardBadge(userId, 'challenge_accepted');
      else if (challenges === 10) await this.awardBadge(userId, 'challenger');
    }

    const hour = new Date().getHours();
    if (hour < 6) await this.awardBadge(userId, 'early_bird');
    else if (hour >= 0 && hour < 4) await this.awardBadge(userId, 'night_owl');

    if (activityType === 'HELPFUL_REPLY_RECEIVED') {
      if ((await storage.getActivityCount(userId, 'HELPFUL_REPLY_RECEIVED')) === 5) {
        await this.awardBadge(userId, 'helper_bee');
      }
    }

    if (activityType === 'PATTERN_DISCOVERY') {
      if ((await storage.getActivityCount(userId, 'PATTERN_DISCOVERY')) === 5) {
        await this.awardBadge(userId, 'pattern_detective');
      }
    }
  }

  private async awardBadge(userId: string, badgeId: string): Promise<void> {
    const hasBadge = await storage.hasUserBadge(userId, badgeId);
    if (hasBadge) return;

    const badgeInfo = BADGES[badgeId as keyof typeof BADGES];
    if(!badgeInfo) return;

    const newBadge: Omit<UserBadge, 'id'> = {
        userId,
        badgeId,
        name: badgeInfo.name,
        description: badgeInfo.description,
        icon: badgeInfo.icon,
        awardedAt: new Date(),
    }
    await storage.createUserBadge(newBadge);

    await storage.recordPointActivity({
      userId,
      points: 25, // Badge unlock bonus
      type: 'BADGE_EARNED',
      description: `Earned badge: ${badgeInfo.name}`,
      createdAt: new Date(),
    });
  }

  private getActivityDescription(activityType: string, metadata?: any): string {
    const descriptions: Record<string, string> = {
      SYMPTOM_LOG_ENTRY: 'Logged symptom data',
      FOOD_LOG_ENTRY: 'Logged food intake',
      SYMPTOM_WHEEL_ENTRY: 'Completed symptom wheel',
      DAILY_LOG_COMPLETE: 'Completed daily health log',
      AI_CONVERSATION_MESSAGE: 'Chatted with AI companion',
      AI_CONVERSATION_SESSION: 'Had a meaningful AI conversation',
      VOICE_INTERACTION: 'Used voice interaction',
      COMMUNITY_POST_CREATE: 'Created a community post',
      COMMUNITY_POST_REPLY: 'Replied to a community post',
      COMMUNITY_POST_LIKE: 'Liked a community post',
      COMMUNITY_POST_SHARE: 'Shared a community post',
      HELPFUL_REPLY_RECEIVED: 'Received a helpful reply badge',
      CHALLENGE_COMPLETE: 'Completed a challenge',
      CHALLENGE_CREATE: 'Created a custom challenge',
      WEEKLY_CHALLENGE_COMPLETE: 'Completed weekly challenge',
      MILESTONE_ACHIEVEMENT: 'Reached a milestone',
      PATTERN_DISCOVERY: 'Discovered a health pattern',
      CORRELATION_FOUND: 'Found a symptom correlation',
      INSIGHT_GENERATED: 'Generated a health insight',
      DAILY_STREAK_BONUS: 'Daily streak bonus',
      WEEKLY_GOAL_COMPLETE: 'Completed weekly goal',
      MONTHLY_MILESTONE: 'Reached monthly milestone',
      PROFILE_COMPLETION: 'Completed profile setup',
      ONBOARDING_COMPLETE: 'Completed onboarding',
      FIRST_TIME_BONUS: 'First time activity bonus',
      WEEKEND_BONUS: 'Weekend activity bonus',
      BIRTHDAY_BONUS: 'Birthday bonus!',
      REFERRAL_SIGNUP: 'Referred a new user',
      HELP_NEWCOMER: 'Helped a newcomer',
      MENTOR_ACTIVITY: 'Mentored another user',
    };

    return descriptions[activityType] || `Completed ${activityType}`;
  }

  async getUserPointsSummary(userId: string): Promise<any> {
    const user = await storage.getUser(userId);
    if (!user) return null;

    const recentActivities = await storage.getRecentPointActivities(userId, 10);
    const badges = await storage.getUserBadges(userId);
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const dailyActivity = await storage.getDailyActivity(userId, todayDateString);
    const nextTierPoints = this.getNextTierThreshold(user.totalPoints);

    return {
      totalPoints: user.totalPoints || 0,
      currentTier: user.currentTier || 'NEWCOMER',
      tierInfo: TIERS[user.currentTier as keyof typeof TIERS] || TIERS.NEWCOMER,
      nextTierPoints: nextTierPoints - user.totalPoints,
      streakDays: user.streakDays || 0,
      todayPoints: dailyActivity?.totalPoints || 0,
      recentActivities,
      badges: badges.map(b => ({
        ...b,
        details: BADGES[b.badgeId as keyof typeof BADGES],
      })),
      badgeCount: badges.length,
      totalBadges: Object.keys(BADGES).length,
    };
  }

  async updateStreak(userId: string): Promise<number> {
    const user = await storage.getUser(userId);
    if (!user) return 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateString = yesterday.toISOString().split('T')[0];
    
    const yesterdayActivity = await storage.getDailyActivity(userId, yesterdayDateString);
    const todayDateString = new Date().toISOString().split('T')[0];
    const todayActivity = await storage.getDailyActivity(userId, todayDateString);

    let newStreakDays = user.streakDays || 0;

    if (todayActivity && todayActivity.totalPoints > 0) {
      if (yesterdayActivity && yesterdayActivity.totalPoints > 0) {
        newStreakDays = (user.streakDays || 0) + 1;
      } else {
        newStreakDays = 1;
      }
    } else {
      if (!yesterdayActivity || yesterdayActivity.totalPoints === 0) {
        newStreakDays = 0;
      }
    }

    await storage.updateUser(userId, {
      streakDays: newStreakDays,
    });

    if (newStreakDays === 7) {
      await this.awardBadge(userId, 'week_streak');
    } else if (newStreakDays === 30) {
      await this.awardBadge(userId, 'month_streak');
    }

    return newStreakDays;
  }

  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly'): Promise<any[]> {
    const leaderboardData = await storage.getLeaderboard(period, 'points');
    return leaderboardData;
  }
}

export const pointsSystem = new PointsSystem();