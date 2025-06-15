import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Zap,
  Crown,
  Medal,
  Gift,
  Clock
} from "lucide-react";

export default function PointsDashboard() {
  // Comprehensive points and achievement system
  const pointsSummary = {
    totalPoints: 1247,
    weeklyPoints: 325,
    currentTier: "Silver Advocate",
    nextTier: "Gold Warrior",
    pointsToNextTier: 253,
    streakDays: 7,
    longestStreak: 14,
    level: 8,
    experiencePoints: 1247,
    nextLevelXP: 1500
  };

  const recentActivities = [
    {
      id: "1",
      type: "daily_symptom_log",
      description: "Logged daily symptoms",
      points: 25,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      bonus: false
    },
    {
      id: "2", 
      type: "challenge_complete",
      description: "Completed mindfulness challenge",
      points: 75,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      bonus: true
    },
    {
      id: "3",
      type: "community_post",
      description: "Shared helpful tip in community",
      points: 50,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      bonus: false
    },
    {
      id: "4",
      type: "weekly_streak",
      description: "7-day logging streak bonus",
      points: 100,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      bonus: true
    }
  ];

  const userBadges = [
    {
      id: "streak_7",
      name: "Week Warrior",
      description: "Log symptoms for 7 consecutive days",
      icon: "🔥",
      rarity: "common",
      earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "first_challenge",
      name: "Challenge Starter",
      description: "Complete your first health challenge",
      icon: "🎯",
      rarity: "common",
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "community_helper",
      name: "Community Helper", 
      description: "Help 5 fellow community members",
      icon: "🤝",
      rarity: "rare",
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const availableBadges = [
    {
      id: "streak_30",
      name: "Monthly Master",
      description: "Log symptoms for 30 consecutive days",
      icon: "👑",
      rarity: "epic",
      progress: 7,
      target: 30
    },
    {
      id: "challenge_expert",
      name: "Challenge Expert",
      description: "Complete 10 different challenges",
      icon: "🏆",
      rarity: "rare", 
      progress: 3,
      target: 10
    },
    {
      id: "wellness_guru",
      name: "Wellness Guru",
      description: "Reach 2000 total points",
      icon: "⭐",
      rarity: "legendary",
      progress: 1247,
      target: 2000
    }
  ];

  const pointsLoading = false;
  const activitiesLoading = false; 
  const badgesLoading = false;
  const availableLoading = false;

  if (pointsLoading || activitiesLoading || badgesLoading || availableLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tierColors = {
    'NEWCOMER': 'text-gray-600 bg-gray-100',
    'EXPLORER': 'text-cyan-600 bg-cyan-100',
    'ADVOCATE': 'text-green-600 bg-green-100',
    'CHAMPION': 'text-yellow-600 bg-yellow-100',
    'GUARDIAN': 'text-purple-600 bg-purple-100',
    'LEGEND': 'text-red-600 bg-red-100',
  };

  const tierIcons = {
    'NEWCOMER': '🌱',
    'EXPLORER': '🔍',
    'ADVOCATE': '💪',
    'CHAMPION': '🏆',
    'GUARDIAN': '🛡️',
    'LEGEND': '⭐',
  };

  const progressPercentage = pointsSummary ? 
    ((pointsSummary.currentPoints) / (pointsSummary.currentPoints + pointsSummary.pointsToNextTier) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Points & Achievements
          </h1>
          <p className="text-gray-600">Track your progress and earn rewards for healthy activities</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Current Points */}
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Current Points</p>
                <p className="text-3xl font-bold">{pointsSummary?.currentPoints || 0}</p>
                <p className="text-blue-100 text-xs">Total earned: {pointsSummary?.totalPoints || 0}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </Card>

          {/* Current Tier */}
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Current Tier</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tierIcons[pointsSummary?.currentTier] || '🌱'}</span>
                  <p className="text-xl font-bold">{pointsSummary?.currentTier || 'Newcomer'}</p>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-purple-100">
                    <span>Progress to next tier</span>
                    <span>{pointsSummary?.pointsToNextTier || 0} points to go</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-purple-300" />
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Crown className="w-8 h-8" />
              </div>
            </div>
          </Card>

          {/* Daily Streak */}
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Daily Streak</p>
                <p className="text-3xl font-bold">{pointsSummary?.streakDays || 0}</p>
                <p className="text-orange-100 text-xs">Longest: {pointsSummary?.longestStreak || 0} days</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Flame className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activities & Badge Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Point Activities */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Recent Activities</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivities?.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    +{activity.pointsEarned}
                  </Badge>
                </div>
              ))}
              {(!recentActivities || recentActivities.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start completing activities to earn points!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Earned Badges */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Medal className="w-5 h-5 text-yellow-600" />
              <h3 className="text-xl font-semibold">Earned Badges</h3>
              <Badge variant="outline">{userBadges?.length || 0}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {userBadges?.slice(0, 6).map((badge, index) => (
                <div key={index} className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{badge.iconUrl || '🏅'}</div>
                    <p className="font-semibold text-sm text-yellow-800">{badge.name}</p>
                    <p className="text-xs text-yellow-600">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!userBadges || userBadges.length === 0) && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Complete activities to unlock badges!</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Available Badges to Earn */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-semibold">Badge Goals</h3>
            <Badge variant="outline">{availableBadges?.length || 0} available</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBadges?.slice(0, 6).map((badge, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{badge.iconUrl || '🎯'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{badge.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          badge.tier === 'bronze' ? 'border-orange-300 text-orange-600' :
                          badge.tier === 'silver' ? 'border-gray-300 text-gray-600' :
                          badge.tier === 'gold' ? 'border-yellow-300 text-yellow-600' :
                          badge.tier === 'platinum' ? 'border-purple-300 text-purple-600' :
                          'border-red-300 text-red-600'
                        }`}
                      >
                        {badge.tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Star className="w-3 h-3" />
                      <span>{badge.pointsReward} points</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Ready to earn more points?</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Target className="w-4 h-4 mr-2" />
                Log Symptoms
              </Button>
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                <Calendar className="w-4 h-4 mr-2" />
                Food Diary
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <Trophy className="w-4 h-4 mr-2" />
                Take Challenges
              </Button>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                <Clock className="w-4 h-4 mr-2" />
                Chat with Luna
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}