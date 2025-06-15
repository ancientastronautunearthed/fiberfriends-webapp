import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { CheckCircle, Circle, Trophy, Sun, CloudSun, Moon, CookingPot, ClipboardCheck, MessageCircle, Star, Target, Heart, Users, Brain, Play } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard-stats"],
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["/api/daily-logs"],
  });

  if (!dashboardStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Ensure dashboardStats has required properties with fallbacks
  const activeChallenges = dashboardStats?.activeChallenges || [];
  const totalActiveChallenges = dashboardStats?.totalActiveChallenges || 0;

  const dailyTasks = [
    { id: 1, name: "Morning Symptom Log", completed: true, icon: ClipboardCheck },
    { id: 2, name: "Log Breakfast", completed: true, icon: Sun },
    { id: 3, name: "Take Supplements", completed: true, icon: Circle },
    { id: 4, name: "Log Lunch", completed: false, icon: CloudSun },
    { id: 5, name: "Evening Log", completed: false, icon: Moon },
  ];

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / dailyTasks.length) * 100;

  const recentActivities = [
    {
      id: 1,
      type: "food",
      title: "Breakfast Logged",
      description: "Oatmeal with berries - 320 calories",
      time: "2 hours ago",
      icon: CookingPot,
      bgColor: "bg-blue-500"
    },
    {
      id: 2,
      type: "symptoms",
      title: "Morning Symptoms Tracked",
      description: "Overall feeling: Good (8/10)",
      time: "3 hours ago",
      icon: ClipboardCheck,
      bgColor: "bg-green-500"
    },
    {
      id: 3,
      type: "community",
      title: "Community Post",
      description: "Shared your success story in the forum",
      time: "Yesterday",
      icon: MessageCircle,
      bgColor: "bg-purple-500"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Good morning, Friend!
            </h1>
            <p className="text-primary-100 text-lg">Let's track your health journey today</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Sun className="w-10 h-10 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Today's Tasks</h3>
            <span className="text-sm text-slate-500">{completedTasks} of {dailyTasks.length} complete</span>
          </div>
          
          <div className="mb-4">
            <Progress value={progressPercentage} className="w-full" />
          </div>
          
          <div className="space-y-3">
            {dailyTasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    task.completed ? "bg-green-50" : "hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                  <span className="text-slate-700">{task.name}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Active Challenges */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Active Challenges</h3>
            <Badge variant="secondary">{totalActiveChallenges}/3</Badge>
          </div>
          
          {activeChallenges && activeChallenges.length > 0 ? (
            <div className="space-y-3">
              {activeChallenges.map((userChallenge: any) => {
                const getCategoryIcon = (category: string) => {
                  switch (category) {
                    case "health": return <Heart className="h-4 w-4" />;
                    case "nutrition": return <Target className="h-4 w-4" />;
                    case "social": return <Users className="h-4 w-4" />;
                    case "mindfulness": return <Brain className="h-4 w-4" />;
                    default: return <Star className="h-4 w-4" />;
                  }
                };

                return (
                  <div key={userChallenge.id} className="border rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(userChallenge.challenge?.category)}
                        <span className="font-medium text-sm">{userChallenge.challenge?.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {userChallenge.challenge?.pointReward || userChallenge.challenge?.points || 0} pts
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <Progress value={userChallenge.progress?.completion_percentage || 0} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        {userChallenge.progress?.completion_percentage || 0}% complete
                      </span>
                      <Link to="/challenges">
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          <Play className="w-3 h-3 mr-1" />
                          Continue
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Target className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm mb-3">No active challenges</p>
              <Link to="/challenges">
                <Button size="sm" variant="outline">
                  Browse Challenges
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Health Overview */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Health Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-700">Symptom Level</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-600">Low</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-700">Mood</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-600">Good</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-slate-700">Sleep Quality</span>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-600">7/10</Badge>
            </div>
          </div>
        </Card>

        {/* Daily Challenge */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-slate-800">Daily Challenge</h3>
          </div>
          <p className="text-slate-600 mb-4">Complete today's nutrition quiz to earn 50 points!</p>
          <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => {
            toast({
              title: "Challenge Started!",
              description: "Answer nutrition questions to earn points.",
            });
          }}>
            Start Challenge
          </Button>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link href="/tracking">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-0 text-center">
              <ClipboardCheck className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-slate-800">Log Symptoms</h4>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/food">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-0 text-center">
              <CookingPot className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h4 className="font-medium text-slate-800">Log Food</h4>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/community">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-0 text-center">
              <MessageCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-slate-800">Community</h4>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/companion">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-0 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-medium text-slate-800">AI Companion</h4>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-6">Recent Activity</h3>
        
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className={`w-10 h-10 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{activity.title}</p>
                  <p className="text-slate-600 text-sm">{activity.description}</p>
                  <span className="text-xs text-slate-500">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
