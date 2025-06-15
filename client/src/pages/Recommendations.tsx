import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Star, 
  Heart, 
  Users, 
  Zap, 
  Award,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Lightbulb,
  Activity
} from "lucide-react";

export default function Recommendations() {
  const [selectedType, setSelectedType] = useState("all");
  const [feedbackData, setFeedbackData] = useState<{ [key: string]: any }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch personalized recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/recommendations/challenges", selectedType],
    enabled: true
  });

  // Fetch user health profile
  const { data: userProfile } = useQuery({
    queryKey: ["/api/recommendations/profile"]
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ challengeId, feedback }: { challengeId: string; feedback: any }) => {
      const response = await apiRequest("POST", "/api/recommendations/feedback", { challengeId, feedback });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations/challenges"] });
      toast({
        title: "Feedback Submitted",
        description: "Thank you! Your feedback helps improve future recommendations."
      });
    }
  });

  const handleFeedback = (challengeId: string, type: 'like' | 'dislike') => {
    const feedback = {
      difficulty: 'just_right',
      enjoyment: type === 'like' ? 5 : 2,
      completion: false
    };
    
    submitFeedbackMutation.mutate({ challengeId, feedback });
    setFeedbackData({ ...feedbackData, [challengeId]: type });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "hard": return "text-red-600 bg-red-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

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

  if (recommendationsLoading) {
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
            <Brain className="h-8 w-8 text-purple-500" />
            Smart Recommendations
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered personalized health challenges with adaptive difficulty
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Health Profile */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Your Health Profile
              </CardTitle>
              <CardDescription>
                AI analysis of your wellness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile ? (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Rate</span>
                      <span className="font-medium">{Math.round(userProfile.completionRate)}%</span>
                    </div>
                    <Progress value={userProfile.completionRate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Engagement Score</span>
                      <span className="font-medium">{Math.round(userProfile.engagementScore)}%</span>
                    </div>
                    <Progress value={userProfile.engagementScore} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Level</span>
                    <Badge variant="outline" className="font-bold">
                      Level {userProfile.currentLevel}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Streak Count</span>
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span className="font-bold">{userProfile.streakCount} days</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Preferred Categories</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userProfile.preferredCategories?.map((category: string) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">
                        Adapted Difficulty: {userProfile.adaptedDifficulty}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Complete some challenges to see your profile analysis
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-2">
          <Tabs value="recommendations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="recommendations">Personalized Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-4">
              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2">
                {['all', 'daily', 'personalized', 'weekly', 'milestone'].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="capitalize"
                  >
                    {type === 'all' ? 'All Types' : type}
                  </Button>
                ))}
              </div>

              {/* Recommendations List */}
              <div className="space-y-4">
                {recommendations?.map((rec: any) => (
                  <Card key={rec.challenge.recommendationId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(rec.challenge.category)}
                            <Badge variant="secondary" className="capitalize">
                              {rec.challenge.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`${getDifficultyColor(rec.adaptedDifficulty)} border-0`}
                            >
                              {rec.adaptedDifficulty}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{rec.challenge.title}</CardTitle>
                          <CardDescription>{rec.challenge.description}</CardDescription>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className={`text-sm font-medium ${getConfidenceColor(rec.confidenceScore)}`}>
                            {Math.round(rec.confidenceScore)}% match
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ~{rec.estimatedCompletionTime} min
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Personalized Message */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-700">{rec.personalizedMessage}</p>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="text-sm text-muted-foreground">
                        <strong>Why this challenge:</strong> {rec.reasoning}
                      </div>

                      {/* Challenge Details */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{rec.challenge.points} points</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{rec.estimatedCompletionTime} min</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Feedback buttons */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(rec.challenge.recommendationId, 'like')}
                            disabled={feedbackData[rec.challenge.recommendationId] === 'like'}
                            className={feedbackData[rec.challenge.recommendationId] === 'like' ? 'text-green-600' : ''}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(rec.challenge.recommendationId, 'dislike')}
                            disabled={feedbackData[rec.challenge.recommendationId] === 'dislike'}
                            className={feedbackData[rec.challenge.recommendationId] === 'dislike' ? 'text-red-600' : ''}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button size="sm">
                            Accept Challenge
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Recommendation confidence</span>
                          <span>{Math.round(rec.confidenceScore)}%</span>
                        </div>
                        <Progress 
                          value={rec.confidenceScore} 
                          className="h-1 mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(!recommendations || recommendations.length === 0) && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete some health activities to build your profile and receive personalized recommendations.
                    </p>
                    <Button>Start Building Your Profile</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}