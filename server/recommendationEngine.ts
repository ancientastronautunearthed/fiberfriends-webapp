import { storage } from "./storage";
import {
  generatePersonalizedChallenge,
  generateDailyChallenge,
  generateWeeklyChallenge,
  generateMilestoneChallenge
} from "./genkit";
import { Challenge, UserChallenge, CommunityPost, UserAchievement } from "./schema";

interface UserHealthProfile {
  userId: string;
  currentLevel: number;
  completionRate: number;
  preferredCategories: string[];
  recentActivity: any[];
  symptomPatterns: any[];
  engagementScore: number;
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
  lastChallengeDate: Date | null;
  streakCount: number;
  totalPoints: number;
}

interface ChallengeRecommendation {
  challenge: any;
  confidenceScore: number;
  reasoning: string;
  adaptedDifficulty: string;
  estimatedCompletionTime: number;
  personalizedMessage: string;
}

// UserContext interface to match genkit expectations
interface UserContext {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  height?: string;
  weight?: string;
  location?: string;
  diagnosisStatus?: string;
  hasFibers?: boolean;
  diagnosisTimeline?: string;
  misdiagnoses?: string[];
  otherDiseases?: string[];
  foodPreferences?: {
    dislikes?: string[];
    favorites?: string[];
  };
  habits?: {
    smoking?: boolean;
    alcohol?: boolean;
    exercise?: string;
  };
  hobbies?: string;
  relationshipStatus?: string;
  hasChildren?: boolean;
  childrenCount?: number;
  childrenAges?: string;
  hasSiblings?: boolean;
  siblingsCount?: number;
  closeFriends?: string;
  familySupport?: string;
  socialPreferences?: string;
  dateOfBirth?: string;
  partnerBirthday?: string;
  childrenBirthdays?: string;
  familyBirthdays?: string;
  importantDates?: string;
  smokingDuration?: string;
  smokingFrequency?: string;
  alcoholDuration?: string;
  alcoholFrequency?: string;
}

export class RecommendationEngine {
  private async buildUserHealthProfile(userId: string): Promise<UserHealthProfile> {
    const [
      user,
      userChallenges,
      dailyLogs,
      symptomPatterns,
      recentAchievements
    ] = await Promise.all([
      storage.getUser(userId),
      storage.getUserChallenges(userId),
      storage.getDailyLogs(userId),
      storage.getSymptomPatterns(userId),
      storage.getUserAchievements(userId)
    ]);

    const completedChallenges = userChallenges.filter(uc => uc.status === 'completed');
    const completionRate = userChallenges.length > 0 ?
      completedChallenges.length / userChallenges.length : 0;

    const challengeDetails = new Map<string, Challenge>();
    const challengePromises = userChallenges.map(uc => storage.getChallenge(uc.challengeId).then(c => {
        if(c) challengeDetails.set(uc.challengeId, c)
    }));
    await Promise.all(challengePromises);

    const categoryFrequency: { [key: string]: number } = {};
    completedChallenges.forEach(uc => {
      const challenge = challengeDetails.get(uc.challengeId);
      const category = challenge?.category || 'health';
      categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
    });

    const preferredCategories = Object.entries(categoryFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const recentChallenges = userChallenges.filter(uc => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(uc.startedAt) > weekAgo;
    });

    const engagementScore = Math.min(100,
      (recentChallenges.length * 20) +
      (completionRate * 50) +
      (recentAchievements.length * 10)
    );

    const recentDifficulties = completedChallenges
      .slice(-5)
      .map(uc => {
          const challenge = challengeDetails.get(uc.challengeId);
          return challenge?.difficulty || 'easy';
      });

    const currentLevel = this.calculateUserLevel(
      completedChallenges.length,
      user?.totalPoints || 0,
      completionRate
    );

    const streakCount = this.calculateStreakCount(userChallenges);

    return {
      userId,
      currentLevel,
      completionRate,
      preferredCategories: preferredCategories.length > 0 ? preferredCategories : ['health'],
      recentActivity: recentChallenges,
      symptomPatterns,
      engagementScore,
      difficultyPreference: this.determineDifficultyPreference(recentDifficulties, completionRate),
      lastChallengeDate: userChallenges.length > 0 ?
        new Date(Math.max(...userChallenges.map(uc => new Date(uc.startedAt).getTime()))) : null,
      streakCount,
      totalPoints: user?.totalPoints || 0
    };
  }

  private calculateUserLevel(completedCount: number, points: number, completionRate: number): number {
    const baseLevel = Math.floor(completedCount / 5) + 1;
    const pointsBonus = Math.floor(points / 100);
    const completionBonus = completionRate > 0.8 ? 2 : completionRate > 0.6 ? 1 : 0;
    
    return Math.min(10, baseLevel + pointsBonus + completionBonus);
  }

  private determineDifficultyPreference(
    recentDifficulties: string[],
    completionRate: number
  ): 'easy' | 'medium' | 'hard' | 'adaptive' {
    if (recentDifficulties.length === 0) return 'adaptive';
    
    const difficultyCount = recentDifficulties.reduce((acc, diff) => {
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const mostCommon = Object.entries(difficultyCount)
      .sort(([, a], [, b]) => b - a)[0][0];

    if (completionRate > 0.9 && mostCommon === 'easy') return 'medium';
    if (completionRate > 0.8 && mostCommon === 'medium') return 'hard';
    if (completionRate < 0.5) return 'easy';
    
    return mostCommon as 'easy' | 'medium' | 'hard';
  }

  private calculateStreakCount(userChallenges: UserChallenge[]): number {
    const sortedChallenges = userChallenges
      .filter(uc => uc.status === 'completed' && uc.completedAt)
      .sort((a, b) => (b.completedAt as Date).getTime() - (a.completedAt as Date).getTime());

    let streak = 0;
    let currentDate = new Date();
    
    for (const challenge of sortedChallenges) {
      const completedDate = challenge.completedAt as Date;
      const daysDiff = Math.floor((currentDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        streak++;
        currentDate = completedDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private adaptDifficultyBasedOnProfile(
    baseDifficulty: string,
    profile: UserHealthProfile
  ): string {
    const { completionRate, engagementScore, currentLevel, streakCount } = profile;
    
    if (completionRate > 0.85 && engagementScore > 70 && streakCount >= 3) {
      if (baseDifficulty === 'easy') return 'medium';
      if (baseDifficulty === 'medium') return 'hard';
    }
    
    if (completionRate < 0.4 || engagementScore < 30) {
      if (baseDifficulty === 'hard') return 'medium';
      if (baseDifficulty === 'medium') return 'easy';
    }
    
    if (currentLevel <= 2 && baseDifficulty === 'hard') return 'medium';
    if (currentLevel >= 7 && baseDifficulty === 'easy') return 'medium';
    
    return baseDifficulty;
  }

  private calculateConfidenceScore(
    challenge: any,
    profile: UserHealthProfile
  ): number {
    let confidence = 50; 
    
    if (profile.preferredCategories.includes(challenge.category)) {
      confidence += 20;
    }
    
    const adaptedDifficulty = this.adaptDifficultyBasedOnProfile(
      challenge.difficulty,
      profile
    );
    if (adaptedDifficulty === challenge.difficulty) {
      confidence += 15;
    }
    
    if (profile.engagementScore > 60) {
      confidence += 10;
    } else if (profile.engagementScore < 30) {
      confidence -= 10;
    }
    
    if (profile.lastChallengeDate) {
      const daysSinceLastChallenge = Math.floor(
        (Date.now() - profile.lastChallengeDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastChallenge === 1) confidence += 15;
      if (daysSinceLastChallenge > 3) confidence -= 5;
    }
    
    if (profile.streakCount > 0) {
      confidence += Math.min(10, profile.streakCount * 2);
    }
    
    return Math.min(100, Math.max(0, confidence));
  }

  private generatePersonalizedMessage(
    challenge: any,
    profile: UserHealthProfile
  ): string {
    const { streakCount, completionRate, currentLevel } = profile;
    
    let message = "";
    
    if (streakCount >= 7) {
      message += `Amazing ${streakCount}-day streak! `;
    } else if (streakCount >= 3) {
      message += `Great ${streakCount}-day momentum! `;
    }
    
    if (completionRate > 0.8) {
      message += "Your consistency is inspiring. ";
    } else if (completionRate > 0.5) {
      message += "You're making steady progress. ";
    } else {
      message += "Every step forward counts. ";
    }
    
    if (currentLevel >= 5) {
      message += "This challenge matches your advanced wellness journey.";
    } else if (currentLevel >= 3) {
      message += "This builds perfectly on your growing experience.";
    } else {
      message += "This gentle challenge supports your wellness foundation.";
    }
    
    return message;
  }

  // Convert UserHealthProfile to UserContext for genkit
  private async profileToUserContext(profile: UserHealthProfile): Promise<UserContext> {
    const user = await storage.getUser(profile.userId);
    const userProfile = user?.profile;
    
    return {
      firstName: user?.displayName?.split(' ')[0],
      lastName: user?.displayName?.split(' ')[1],
      age: userProfile?.age,
      location: userProfile?.location,
      // Add other relevant mappings based on available data
      habits: {
        exercise: 'moderate' // Default value, could be derived from daily logs
      }
    };
  }

  public async generateRecommendations(
    userId: string,
    requestedType?: string,
    count: number = 3
  ): Promise<ChallengeRecommendation[]> {
    const profile = await this.buildUserHealthProfile(userId);
    const recommendations: ChallengeRecommendation[] = [];
    
    const challengeTypes = requestedType ?
      [requestedType] :
      ['daily', 'personalized', 'weekly'];
    
    for (const type of challengeTypes) {
      try {
        let challenge;
        
        switch (type) {
          case 'personalized':
            const userContext = await this.profileToUserContext(profile);
            challenge = await generatePersonalizedChallenge(
              userContext,
              profile.recentActivity
            );
            break;
          case 'weekly':
            const communityData: CommunityPost[] = await storage.getCommunityPosts();
            challenge = await generateWeeklyChallenge(communityData);
            break;
          case 'milestone':
            const achievements: UserAchievement[] = await storage.getUserAchievements(userId);
            const userContextForMilestone = await this.profileToUserContext(profile);
            challenge = await generateMilestoneChallenge(achievements, userContextForMilestone);
            break;
          default:
            challenge = await generateDailyChallenge();
        }
        
        if (challenge) {
          const adaptedDifficulty = this.adaptDifficultyBasedOnProfile(
            challenge.difficulty || 'medium',
            profile
          ) as 'easy' | 'medium' | 'hard';
          
          challenge.difficulty = adaptedDifficulty;
          
          const difficultyMultiplier: Record<'easy' | 'medium' | 'hard', number> = {
            'easy': 0.8,
            'medium': 1.0,
            'hard': 1.3
          };
          challenge.points = Math.round(
            (challenge.points || 25) * (difficultyMultiplier[adaptedDifficulty] || 1.0)
          );
          
          const confidenceScore = this.calculateConfidenceScore(challenge, profile);
          const personalizedMessage = this.generatePersonalizedMessage(challenge, profile);
          
          const baseTime: Record<'easy' | 'medium' | 'hard', number> = {
            'easy': 15,
            'medium': 30,
            'hard': 45
          };
          const estimatedTime = Math.round(
            baseTime[adaptedDifficulty] * (1 + (10 - profile.currentLevel) * 0.1)
          );
          
          recommendations.push({
            challenge: {
              ...challenge,
              type,
              recommendationId: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              adaptedForUser: true
            },
            confidenceScore,
            reasoning: this.generateReasoning(challenge, profile, type),
            adaptedDifficulty,
            estimatedCompletionTime: estimatedTime,
            personalizedMessage
          });
        }
      } catch (error) {
        console.error(`Failed to generate ${type} challenge:`, error);
      }
    }
    
    return recommendations
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, count);
  }

  private generateReasoning(
    challenge: any,
    profile: UserHealthProfile,
    type: string
  ): string {
    const reasons = [];
    
    if (profile.preferredCategories.includes(challenge.category)) {
      reasons.push(`matches your preferred ${challenge.category} activities`);
    }
    
    if (profile.completionRate > 0.7) {
      reasons.push("aligns with your strong completion history");
    }
    
    if (profile.streakCount >= 3) {
      reasons.push("maintains your current wellness momentum");
    }
    
    if (type === 'personalized') {
      reasons.push("specifically designed for your health patterns");
    }
    
    if (profile.currentLevel >= 5) {
      reasons.push("appropriate for your advanced wellness level");
    }
    
    return reasons.length > 0 ?
      `Recommended because it ${reasons.slice(0, 2).join(" and ")}.` :
      "Recommended based on your overall wellness profile.";
  }

  public async updateUserFeedback(
    userId: string,
    challengeId: string,
    feedback: {
      difficulty: 'too_easy' | 'just_right' | 'too_hard';
      enjoyment: number; // 1-5 scale
      completion: boolean;
      timeSpent?: number;
    }
  ): Promise<void> {
    console.log(`User ${userId} feedback for challenge ${challengeId}:`, feedback);
  }
}

export const recommendationEngine = new RecommendationEngine();