import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Medal, Crown, Star, Gift, Lock, CheckCircle2, Target, Users, Heart, Brain, Calendar } from "lucide-react";

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all achievements with category filter
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory !== "all" 
        ? `/api/achievements?category=${selectedCategory}`
        : "/api/achievements";
      const response = await apiRequest("GET", url);
      return response.json();
    }
  });

  // Fetch user's achievements
  const { data: userAchievements = [], isLoading: userAchievementsLoading } = useQuery({
    queryKey: ["/api/user-achievements"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user-achievements");
      return response.json();
    }
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard", "all_time", "points"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/leaderboard?period=all_time&category=points&limit=10");
      return response.json();
    }
  });

  // Unlock achievement mutation
  const unlockAchievementMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const response = await apiRequest("POST", "/api/user-achievements/unlock", { achievementId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-achievements"] });
      toast({
        title: "Achievement Unlocked!",
        description: "Congratulations! You've earned a new achievement and points."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unlock achievement. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "bronze": return <Medal className="h-5 w-5 text-amber-600" />;
      case "silver": return <Medal className="h-5 w-5 text-gray-400" />;
      case "gold": return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "platinum": return <Crown className="h-5 w-5 text-purple-500" />;
      default: return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "border-amber-600 bg-amber-50";
      case "silver": return "border-gray-400 bg-gray-50";
      case "gold": return "border-yellow-500 bg-yellow-50";
      case "platinum": return "border-purple-500 bg-purple-50";
      default: return "border-blue-500 bg-blue-50";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health": return <Heart className="h-4 w-4" />;
      case "social": return <Users className="h-4 w-4" />;
      case "consistency": return <Calendar className="h-4 w-4" />;
      case "milestone": return <Target className="h-4 w-4" />;
      case "wellness": return <Brain className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return Array.isArray(userAchievements) && userAchievements.some((ua: any) => ua.achievementId === achievementId);
  };

  const getUserAchievement = (achievementId: string) => {
    return Array.isArray(userAchievements) ? userAchievements.find((ua: any) => ua.achievementId === achievementId) : undefined;
  };

  const categories = [
    { id: "all", name: "All Categories", icon: <Star className="h-4 w-4" /> },
    { id: "health", name: "Health", icon: <Heart className="h-4 w-4" /> },
    { id: "social", name: "Social", icon: <Users className="h-4 w-4" /> },
    { id: "consistency", name: "Consistency", icon: <Calendar className="h-4 w-4" /> },
    { id: "milestone", name: "Milestones", icon: <Target className="h-4 w-4" /> },
    { id: "wellness", name: "Wellness", icon: <Brain className="h-4 w-4" /> }
  ];

  if (achievementsLoading || userAchievementsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const totalAchievements = Array.isArray(achievements) ? achievements.length : 0;
  const unlockedAchievements = Array.isArray(userAchievements) ? userAchievements.length : 0;
  const totalPoints = Array.isArray(userAchievements) 
    ? userAchievements.reduce((sum: number, ua: any) => sum + (ua.pointsEarned || 0), 0) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Achievements & Rewards
        </h1>
        <p className="text-muted-foreground">Unlock achievements and earn rewards for your wellness journey</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">From achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockedAchievements}/{totalAchievements}</div>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-1"
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(achievements) && achievements.map((achievement: any) => {
              const isUnlocked = isAchievementUnlocked(achievement.id);
              const userAchievement = getUserAchievement(achievement.id);
              const tierColor = getTierColor(achievement.tier || 'default');

              return (
                <Card 
                  key={achievement.id} 
                  className={`${tierColor} ${!isUnlocked ? 'opacity-75' : ''} hover:shadow-lg transition-all duration-200`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTierIcon(achievement.tier || 'default')}
                        {getCategoryIcon(achievement.category)}
                      </div>
                      {isUnlocked && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </div>
                    <CardTitle className="text-lg">
                      {achievement.title}
                    </CardTitle>
                    <CardDescription className={isUnlocked ? '' : 'text-muted-foreground'}>
                      {achievement.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{achievement.points || 0} points</span>
                      </div>
                      {isUnlocked ? (
                        <Badge variant="default" className="bg-green-500">
                          Unlocked
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => unlockAchievementMutation.mutate(achievement.id)}
                          disabled={unlockAchievementMutation.isPending}
                          size="sm"
                          variant="outline"
                        >
                          Unlock
                        </Button>
                      )}
                    </div>
                    
                    {isUnlocked && userAchievement && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Unlocked: {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    {achievement.requirements && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Requirements: {JSON.stringify(achievement.requirements)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {(!Array.isArray(achievements) || achievements.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Achievements Available</h3>
                <p className="text-muted-foreground">
                  Complete challenges and engage with the platform to unlock achievements.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>All-time points leaders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(leaderboard) && leaderboard.map((entry: any, index: number) => (
                  <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-muted-foreground/20'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{entry.displayName || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">Level {entry.level || 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{entry.score || 0}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>

              {(!Array.isArray(leaderboard) || leaderboard.length === 0) && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leaderboard data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}