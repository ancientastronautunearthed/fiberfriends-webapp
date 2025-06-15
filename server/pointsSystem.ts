import { storage } from "./storage";
import { v4 as uuidv4 } from "crypto";

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
  GUARDIAN: { min: 1500, max: 2999, badge: "🛡️", color: "#8b5cf6" },
  LEGEND: { min: 3000, max: Infinity, badge: "⭐", color: "#ef4444" },
};

// Badge definitions for achievements
export const BADGE_DEFINITIONS = [
  // Engagement Badges
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Log symptoms before 8 AM for 7 consecutive days",
    category: "engagement",
    tier: "bronze",
    pointsReward: 50,
    iconUrl: "🌅",
    requirements: { type: "early_logging", days: 7 }
  },
  {
    id: "night_owl",
    name: "Night Owl", 
    description: "Log symptoms after 10 PM for 5 consecutive days",
    category: "engagement",
    tier: "bronze",
    pointsReward: 30,
    iconUrl: "🦉",
    requirements: { type: "late_logging", days: 5 }
  },
  {
    id: "consistency_king",
    name: "Consistency King",
    description: "Complete daily logs for 30 consecutive days",
    category: "achievement",
    tier: "gold",
    pointsReward: 200,
    iconUrl: "👑",
    requirements: { type: "daily_streak", days: 30 }
  },
  
  // Community Badges
  {
    id: "helper",
    name: "Helper",
    description: "Receive 10 likes on your community posts",
    category: "engagement",
    tier: "bronze",
    pointsReward: 50,
    iconUrl: "🤝",
    requirements: { type: "community_likes", count: 10 }
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Help 5 new users with helpful replies",
    category: "achievement",
    tier: "silver",
    pointsReward: 100,
    iconUrl: "🧑‍🏫",
    requirements: { type: "help_newcomers", count: 5 }
  },
  {
    id: "community_champion",
    name: "Community Champion",
    description: "Create 25 community posts",
    category: "achievement",
    tier: "gold",
    pointsReward: 150,
    iconUrl: "📢",
    requirements: { type: "posts_created", count: 25 }
  },
  
  // Health Tracking Badges
  {
    id: "symptom_tracker",
    name: "Symptom Tracker",
    description: "Log symptoms 50 times",
    category: "milestone",
    tier: "bronze",
    pointsReward: 75,
    iconUrl: "📊",
    requirements: { type: "symptom_logs", count: 50 }
  },
  {
    id: "food_detective",
    name: "Food Detective",
    description: "Log food entries 100 times",
    category: "milestone",
    tier: "silver",
    pointsReward: 100,
    iconUrl: "🔍",
    requirements: { type: "food_logs", count: 100 }
  },
  {
    id: "pattern_finder",
    name: "Pattern Finder",
    description: "Discover 5 symptom-food correlations",
    category: "achievement",
    tier: "gold",
    pointsReward: 200,
    iconUrl: "🧩",
    requirements: { type: "patterns_found", count: 5 }
  },
  
  // AI Companion Badges
  {
    id: "luna_friend",
    name: "Luna's Friend",
    description: "Have 20 conversations with Luna",
    category: "engagement",
    tier: "bronze",
    pointsReward: 50,
    iconUrl: "💬",
    requirements: { type: "ai_conversations", count: 20 }
  },
  {
    id: "voice_chat_expert",
    name: "Voice Chat Expert",
    description: "Use voice features 25 times",
    category: "milestone",
    tier: "silver",
    pointsReward: 75,
    iconUrl: "🎤",
    requirements: { type: "voice_interactions", count: 25 }
  },
  
  // Challenge Badges
  {
    id: "challenger",
    name: "Challenger",
    description: "Complete 10 health challenges",
    category: "achievement",
    tier: "bronze",
    pointsReward: 100,
    iconUrl: "🎯",
    requirements: { type: "challenges_completed", count: 10 }
  },
  {
    id: "challenge_master",
    name: "Challenge Master",
    description: "Complete 50 health challenges",
    category: "achievement",
    tier: "gold",
    pointsReward: 300,
    iconUrl: "🏅",
    requirements: { type: "challenges_completed", count: 50 }
  },
  
  // Special Badges
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Complete all daily activities for a full week",
    category: "special",
    tier: "silver",
    pointsReward: 150,
    iconUrl: "⚔️",
    requirements: { type: "weekly_complete", weeks: 1 }
  },
  {
    id: "month_master",
    name: "Month Master",
    description: "Complete all daily activities for a full month",
    category: "special",
    tier: "platinum",
    pointsReward: 500,
    iconUrl: "🗓️",
    requirements: { type: "monthly_complete", months: 1 }
  },
  {
    id: "anniversary",
    name: "Anniversary",
    description: "Use Fiber Friends for one full year",
    category: "special",
    tier: "diamond",
    pointsReward: 1000,
    iconUrl: "🎉",
    requirements: { type: "anniversary", years: 1 }
  }
];

export class PointsSystem {
  
  // Award points for specific activity
  async awardPoints(
    userId: string, 
    activityType: string, 
    description?: string, 
    metadata?: any
  ): Promise<number> {
    const pointsEarned = POINT_VALUES[activityType] || 0;
    
    if (pointsEarned <= 0) {
      return 0;
    }

    // Check for bonuses
    let totalPoints = pointsEarned;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Weekend bonus
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      totalPoints += POINT_VALUES.WEEKEND_BONUS;
    }
    
    // First time bonus
    const isFirstTime = await this.isFirstTimeActivity(userId, activityType);
    if (isFirstTime) {
      totalPoints += POINT_VALUES.FIRST_TIME_BONUS;
    }
    
    // Streak bonus
    const user = await storage.getUser(userId);
    if (user?.streakDays && user.streakDays > 0) {
      totalPoints += Math.min(user.streakDays * POINT_VALUES.DAILY_STREAK_BONUS, 100); // Cap at 100 bonus points
    }

    // Record the activity
    await storage.createPointActivity({
      userId,
      activityType,
      pointsEarned: totalPoints,
      description: description || this.getActivityDescription(activityType),
      metadata: {
        ...metadata,
        bonuses: {
          weekend: (dayOfWeek === 0 || dayOfWeek === 6) ? POINT_VALUES.WEEKEND_BONUS : 0,
          firstTime: isFirstTime ? POINT_VALUES.FIRST_TIME_BONUS : 0,
          streak: user?.streakDays ? Math.min(user.streakDays * POINT_VALUES.DAILY_STREAK_BONUS, 100) : 0
        }
      }
    });

    // Update user points and check for tier changes
    await this.updateUserPoints(userId, totalPoints);
    
    // Update daily activity tracking
    await this.updateDailyActivity(userId, today, activityType, totalPoints);
    
    // Check for badge unlocks
    await this.checkBadgeUnlocks(userId, activityType, metadata);
    
    return totalPoints;
  }

  // Update user's total points and tier
  private async updateUserPoints(userId: string, pointsToAdd: number): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;

    const newTotalPoints = (user.totalPoints || 0) + pointsToAdd;
    const newCurrentPoints = (user.points || 0) + pointsToAdd;
    
    // Determine new tier
    const newTier = this.calculateTier(newTotalPoints);
    const nextTierPoints = this.getNextTierThreshold(newTotalPoints);

    await storage.updateUser(userId, {
      points: newCurrentPoints,
      totalPoints: newTotalPoints,
      currentTier: newTier,
      nextTierPoints: nextTierPoints - newTotalPoints, // Points needed for next tier
    });

    // Check if tier changed and award tier badge
    if (user.currentTier !== newTier) {
      await this.awardTierBadge(userId, newTier);
    }
  }

  // Calculate tier based on total points
  private calculateTier(totalPoints: number): string {
    for (const [tierName, tierData] of Object.entries(TIERS)) {
      if (totalPoints >= tierData.min && totalPoints <= tierData.max) {
        return tierName;
      }
    }
    return "NEWCOMER";
  }

  // Get next tier threshold
  private getNextTierThreshold(currentPoints: number): number {
    const tierEntries = Object.entries(TIERS);
    for (let i = 0; i < tierEntries.length; i++) {
      const [, tierData] = tierEntries[i];
      if (currentPoints >= tierData.min && currentPoints <= tierData.max) {
        // Return the minimum of the next tier, or current max if at highest tier
        const nextTier = tierEntries[i + 1];
        return nextTier ? nextTier[1].min : tierData.max;
      }
    }
    return TIERS.EXPLORER.min; // Default to first tier threshold
  }

  // Update daily activity tracking
  private async updateDailyActivity(
    userId: string, 
    date: string, 
    activityType: string, 
    pointsEarned: number
  ): Promise<void> {
    let dailyActivity = await storage.getDailyActivity(userId, date);
    
    if (!dailyActivity) {
      dailyActivity = await storage.createDailyActivity({
        userId,
        date,
        activitiesCompleted: [activityType],
        totalPoints: pointsEarned,
        streakEligible: this.isStreakEligibleActivity(activityType),
      });
    } else {
      const activities = dailyActivity.activitiesCompleted || [];
      if (!activities.includes(activityType)) {
        activities.push(activityType);
      }
      
      await storage.updateDailyActivity(dailyActivity.id, {
        activitiesCompleted: activities,
        totalPoints: (dailyActivity.totalPoints || 0) + pointsEarned,
        streakEligible: dailyActivity.streakEligible || this.isStreakEligibleActivity(activityType),
      });
    }

    // Update user streak
    await this.updateUserStreak(userId, date);
  }

  // Update user's daily streak
  private async updateUserStreak(userId: string, date: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;

    const today = new Date(date);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayActivity = await storage.getDailyActivity(userId, date);
    const yesterdayActivity = await storage.getDailyActivity(userId, yesterdayStr);

    let newStreakDays = 1; // At least today
    
    if (todayActivity?.streakEligible) {
      if (yesterdayActivity?.streakEligible && user.lastActiveDate === yesterdayStr) {
        // Continue streak
        newStreakDays = (user.streakDays || 0) + 1;
      }
      // If there's a gap, streak resets to 1
    } else {
      // Today is not streak eligible, keep current streak but don't increment
      newStreakDays = user.streakDays || 0;
    }

    const longestStreak = Math.max(newStreakDays, user.longestStreak || 0);

    await storage.updateUser(userId, {
      streakDays: newStreakDays,
      longestStreak,
      lastActiveDate: date,
    });
  }

  // Check if activity is eligible for streak counting
  private isStreakEligibleActivity(activityType: string): boolean {
    const streakActivities = [
      'SYMPTOM_LOG_ENTRY',
      'FOOD_LOG_ENTRY', 
      'DAILY_LOG_COMPLETE',
      'SYMPTOM_WHEEL_ENTRY',
      'AI_CONVERSATION_SESSION'
    ];
    return streakActivities.includes(activityType);
  }

  // Check if this is the first time doing this activity
  private async isFirstTimeActivity(userId: string, activityType: string): Promise<boolean> {
    const existingActivity = await storage.getPointActivitiesByType(userId, activityType);
    return existingActivity.length === 0;
  }

  // Get description for activity type
  private getActivityDescription(activityType: string): string {
    const descriptions = {
      SYMPTOM_LOG_ENTRY: "Logged symptoms for health tracking",
      FOOD_LOG_ENTRY: "Recorded food intake",
      AI_CONVERSATION_MESSAGE: "Chatted with Luna AI companion",
      COMMUNITY_POST_CREATE: "Created a community post",
      CHALLENGE_COMPLETE: "Completed a health challenge",
      DAILY_STREAK_BONUS: "Daily activity streak bonus",
      // Add more as needed
    };
    return descriptions[activityType] || "Completed activity";
  }

  // Award tier badge when user reaches new tier
  private async awardTierBadge(userId: string, tier: string): Promise<void> {
    const tierBadgeId = `tier_${tier.toLowerCase()}`;
    const tierInfo = TIERS[tier];
    
    await storage.createUserBadge({
      userId,
      badgeId: tierBadgeId,
      progress: { tier, pointsAtUnlock: (await storage.getUser(userId))?.totalPoints }
    });
  }

  // Check for badge unlocks based on activity
  private async checkBadgeUnlocks(userId: string, activityType: string, metadata?: any): Promise<void> {
    // This would implement complex badge checking logic
    // For now, let's implement a few key badges
    
    for (const badge of BADGE_DEFINITIONS) {
      const hasUnlocked = await storage.hasUserBadge(userId, badge.id);
      if (hasUnlocked) continue;

      let shouldUnlock = false;
      
      switch (badge.requirements.type) {
        case 'symptom_logs':
          if (activityType === 'SYMPTOM_LOG_ENTRY') {
            const count = await storage.getActivityCount(userId, 'SYMPTOM_LOG_ENTRY');
            shouldUnlock = count >= badge.requirements.count;
          }
          break;
          
        case 'food_logs':
          if (activityType === 'FOOD_LOG_ENTRY') {
            const count = await storage.getActivityCount(userId, 'FOOD_LOG_ENTRY');
            shouldUnlock = count >= badge.requirements.count;
          }
          break;
          
        case 'community_likes':
          if (activityType === 'COMMUNITY_POST_LIKE' && metadata?.isReceived) {
            const count = await storage.getCommunityLikesReceived(userId);
            shouldUnlock = count >= badge.requirements.count;
          }
          break;
          
        case 'daily_streak':
          const user = await storage.getUser(userId);
          shouldUnlock = (user?.streakDays || 0) >= badge.requirements.days;
          break;
      }

      if (shouldUnlock) {
        await storage.createUserBadge({
          userId,
          badgeId: badge.id,
          progress: { unlockedAt: new Date().toISOString() }
        });
        
        // Award badge points
        if (badge.pointsReward > 0) {
          await this.awardPoints(userId, 'BADGE_UNLOCK', `Unlocked badge: ${badge.name}`, { badgeId: badge.id });
        }
      }
    }
  }

  // Get user's points summary
  async getUserPointsSummary(userId: string) {
    const user = await storage.getUser(userId);
    if (!user) return null;

    const tierInfo = TIERS[user.currentTier || 'NEWCOMER'];
    const recentActivities = await storage.getRecentPointActivities(userId, 10);
    const userBadges = await storage.getUserBadges(userId);
    
    return {
      currentPoints: user.points || 0,
      totalPoints: user.totalPoints || 0,
      currentTier: user.currentTier || 'NEWCOMER',
      tierInfo,
      pointsToNextTier: user.nextTierPoints || 100,
      streakDays: user.streakDays || 0,
      longestStreak: user.longestStreak || 0,
      recentActivities,
      badges: userBadges,
      weeklyProgress: user.weeklyGoalProgress || {}
    };
  }

  // Get available badges for user to work toward
  async getAvailableBadges(userId: string) {
    const userBadges = await storage.getUserBadges(userId);
    const unlockedBadgeIds = userBadges.map(ub => ub.badgeId);
    
    return BADGE_DEFINITIONS.filter(badge => !unlockedBadgeIds.includes(badge.id));
  }
}

export const pointsSystem = new PointsSystem();