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

  // Fetch all achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements"],
    queryParams: selectedCategory !== "all" ? { category: selectedCategory } : {}
  });

  // Fetch user's achievements
  const { data: userAchievements, isLoading: userAchievementsLoading } = useQuery({
    queryKey: ["/api/user-achievements"]
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryParams: { period: "all_time", category: "points", limit: "10" }
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
    return userAchievements?.some((ua: any) => ua.achievementId === achievementId);
  };

  const getUserAchievement = (achievementId: string) => {
    return userAchievements?.find((ua: any) => ua.achievementId === achievementId);
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

  const totalAchievements = achievements?.length || 0;
  const unlockedAchievements = userAchievements?.length || 0;
  const totalPoints = userAchievements?.reduce((sum: number, ua: any) => sum + (ua.pointsEarned || 0), 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your wellness journey and unlock meaningful milestones
          </p>
        </div>
        
        <div className="flex gap-4 text-center">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-500">{unlockedAchievements}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-500">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-500">
              {totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>
      </div>

      <Tabs value="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">My Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements?.map((achievement: any) => {
              const isUnlocked = isAchievementUnlocked(achievement.id);
              const userAchievement = getUserAchievement(achievement.id);
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`transition-all duration-200 ${
                    isUnlocked 
                      ? `${getTierColor(achievement.tier)} shadow-lg` 
                      : 'opacity-75 hover:opacity-90'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                        {getTierIcon(achievement.tier)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(achievement.category)}
                        <Badge variant="secondary" className="capitalize">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className={`text-lg ${!isUnlocked ? 'text-muted-foreground' : ''}`}>
                      {achievement.title}
                    </CardTitle>
                    <CardDescription className={!isUnlocked ? 'text-muted-foreground' : ''}>
                      {achievement.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{achievement.pointValue} points</span>
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

          {(!achievements || achievements.length === 0) && (
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

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Points Leaderboard
              </CardTitle>
              <CardDescription>
                Top community members by total points earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.map((entry: any, index: number) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">User {entry.userId.slice(-6)}</div>
                        <div className="text-sm text-muted-foreground">
                          Rank #{entry.rank || index + 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{entry.score}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>

              {(!leaderboard || leaderboard.length === 0) && (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Leaderboard Data</h3>
                  <p className="text-muted-foreground">
                    Complete challenges to appear on the leaderboard.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}