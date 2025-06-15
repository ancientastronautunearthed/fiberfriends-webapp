import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChallengeTracker } from "@/components/challenge-trackers/ChallengeTracker";
import { Trophy, Target, Calendar, Star, Gift, Zap, Heart, Users, Brain, Play } from "lucide-react";

export default function Challenges() {
  const [selectedTab, setSelectedTab] = useState("available");
  const [activeTracker, setActiveTracker] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available challenges
  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["/api/challenges"]
  });

  // Fetch user's challenges
  const { data: userChallenges, isLoading: userChallengesLoading } = useQuery({
    queryKey: ["/api/user-challenges"]
  });

  // Generate new challenge mutation
  const generateChallengeMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest("POST", "/api/challenges/generate", { type });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({
        title: "Challenge Generated",
        description: "A new personalized challenge has been created for you!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate challenge. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Accept challenge mutation
  const acceptChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const response = await apiRequest("POST", "/api/user-challenges/accept", { challengeId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-challenges"] });
      toast({
        title: "Challenge Accepted",
        description: "You've successfully joined this challenge!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept challenge. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Complete challenge mutation
  const completeChallengeMutation = useMutation({
    mutationFn: async ({ id, pointsEarned }: { id: string; pointsEarned: number }) => {
      const response = await apiRequest("PUT", `/api/user-challenges/${id}/complete`, { pointsEarned });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-challenges"] });
      toast({
        title: "Challenge Completed!",
        description: "Congratulations! You've earned points for completing this challenge."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health": return <Heart className="h-4 w-4" />;
      case "nutrition": return <Target className="h-4 w-4" />;
      case "social": return <Users className="h-4 w-4" />;
      case "mindfulness": return <Brain className="h-4 w-4" />;
      case "physical": return <Zap className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (challengesLoading || userChallengesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Health Challenges
          </h1>
          <p className="text-muted-foreground mt-2">
            Engage in AI-powered challenges designed to support your wellness journey
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => generateChallengeMutation.mutate("daily")}
            disabled={generateChallengeMutation.isPending}
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Daily Challenge
          </Button>
          <Button
            onClick={() => generateChallengeMutation.mutate("personalized")}
            disabled={generateChallengeMutation.isPending}
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Personal
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Challenges</TabsTrigger>
          <TabsTrigger value="active">My Active Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges?.map((challenge: any) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(challenge.category)}
                      <Badge variant="secondary" className="capitalize">
                        {challenge.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getDifficultyColor(challenge.difficulty)}`} />
                      <span className="text-sm text-muted-foreground capitalize">
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{challenge.pointReward || challenge.points} points</span>
                    </div>
                    <Button
                      onClick={() => acceptChallengeMutation.mutate(challenge.id)}
                      disabled={acceptChallengeMutation.isPending}
                      size="sm"
                    >
                      Accept Challenge
                    </Button>
                  </div>
                  {challenge.validUntil && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Expires: {new Date(challenge.validUntil).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {(!challenges || challenges.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Challenges Available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate new personalized challenges to get started on your wellness journey.
                </p>
                <Button
                  onClick={() => generateChallengeMutation.mutate("daily")}
                  disabled={generateChallengeMutation.isPending}
                >
                  Generate Daily Challenge
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeTracker ? (
            // Show interactive tracker interface
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Interactive Challenge Tracker</h2>
                <Button onClick={() => setActiveTracker(null)} variant="outline">
                  Back to List
                </Button>
              </div>
              {(() => {
                const userChallenge = userChallenges?.find((uc: any) => uc.id === activeTracker);
                if (!userChallenge?.challenge) return null;
                
                return (
                  <ChallengeTracker
                    challenge={userChallenge.challenge}
                    userChallengeId={userChallenge.id}
                  />
                );
              })()}
            </div>
          ) : (
            // Show list of active challenges
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userChallenges?.filter((uc: any) => uc.status === 'active').map((userChallenge: any) => (
                  <Card key={userChallenge.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(userChallenge.challenge?.category || 'health')}
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <CardTitle className="text-lg">{userChallenge.challenge?.title || 'Challenge'}</CardTitle>
                      <CardDescription>{userChallenge.challenge?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{userChallenge.progress?.completion_percentage || 0}%</span>
                          </div>
                          <Progress value={userChallenge.progress?.completion_percentage || 0} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">
                              {userChallenge.challenge?.pointReward || userChallenge.challenge?.points || 0} points
                            </span>
                          </div>
                          <Button
                            onClick={() => setActiveTracker(userChallenge.id)}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Start Tracker
                          </Button>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Started: {new Date(userChallenge.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(!userChallenges || userChallenges.filter((uc: any) => uc.status === 'active').length === 0) && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
                    <p className="text-muted-foreground mb-4">
                      Accept challenges from the available tab to start your wellness journey.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userChallenges?.filter((uc: any) => uc.status === 'completed').map((userChallenge: any) => (
              <Card key={userChallenge.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <Badge variant="default" className="bg-green-500">Completed</Badge>
                  </div>
                  <CardTitle className="text-lg">{userChallenge.challenge?.title || 'Challenge'}</CardTitle>
                  <CardDescription>{userChallenge.challenge?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{userChallenge.pointsEarned} points earned</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(userChallenge.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!userChallenges || userChallenges.filter((uc: any) => uc.status === 'completed').length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Challenges</h3>
                <p className="text-muted-foreground">
                  Complete challenges to see your achievements here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}