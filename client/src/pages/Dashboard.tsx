import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { CheckCircle, Circle, Trophy, Sun, CookingPot, ClipboardCheck, MessageCircle, Star, Target, Heart, Users, Brain, Play, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserDashboard } from "@/lib/api"; // You would create this function to fetch all dashboard data
import { Skeleton } from "@/components/ui/skeleton"; // For the loading state

// Define the shape of the data you expect from your API
interface DashboardData {
  user: {
    displayName: string;
    currentTier: string;
    totalPoints: number;
    streakDays: number;
  };
  dailyTasks: { id: number; name: string; completed: boolean; icon: React.ElementType }[];
  activeChallenges: {
    id: number;
    progress: number;
    challenge: {
      title: string;
      category: string;
      pointReward: number;
    };
  }[];
  healthOverview: {
    symptomLevel: 'Low' | 'Medium' | 'High';
    mood: 'Good' | 'Neutral' | 'Bad';
    sleepQuality: number; // e.g., 7
  };
  recentActivities: {
    id: number;
    type: string;
    title: string;
    description: string;
    time: string;
    icon: React.ElementType;
    bgColor: string;
  }[];
}


export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showDailyPrompt, setShowDailyPrompt] = useState(false);

  // Fetch all dashboard data with one query
  const { data, isLoading, isError, error } = useQuery<DashboardData>({
    queryKey: ['dashboardData'],
    queryFn: getUserDashboard, // Assumes this API function exists in `lib/api.ts`
  });

  // Check if user has logged symptoms today (client-side logic is fine for this)
  useEffect(() => {
    const lastLogDate = localStorage.getItem('last-symptom-log-date');
    const today = new Date().toISOString().split('T')[0];
    if (lastLogDate !== today) {
      setShowDailyPrompt(true);
    }
  }, []);

  // Show a skeleton loader while data is being fetched
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show a user-friendly error message if fetching fails
  if (isError) {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh]">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold">Could not load dashboard</h2>
            <p className="text-muted-foreground">There was a problem fetching your data. Please try again later.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Reload Page</Button>
        </div>
    );
  }

  const { user, dailyTasks, activeChallenges, healthOverview, recentActivities } = data;
  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / dailyTasks.length) * 100;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Good morning, {user.displayName}!
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

      {/* Daily Symptom Prompt */}
      {showDailyPrompt && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0"><AlertCircle className="h-6 w-6 text-amber-600" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Start Your Day Right - Log Your Symptoms</h3>
                <p className="text-amber-700 mb-4">You haven't recorded your daily symptom check-in yet. Tracking helps Luna provide better support.</p>
                <div className="flex gap-3">
                  <Button onClick={() => setLocation('/daily-symptom-prompt')} className="bg-amber-600 hover:bg-amber-700 text-white"><ClipboardCheck className="h-4 w-4 mr-2" />Log Symptoms Now</Button>
                  <Button variant="ghost" onClick={() => setShowDailyPrompt(false)} className="text-amber-700 hover:text-amber-900">Remind me later</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Today's Tasks</h3>
            <span className="text-sm text-slate-500">{completedTasks} of {dailyTasks.length} complete</span>
          </div>
          <Progress value={progressPercentage} className="w-full mb-4" />
          <div className="space-y-3">
            {dailyTasks.map((task) => (
              <div key={task.id} className={`flex items-center gap-3 p-2 rounded-lg ${task.completed ? "bg-green-50" : "hover:bg-slate-50"}`}>
                {task.completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                <span className="text-slate-700">{task.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Challenges */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Active Challenges</h3>
            <Badge variant="secondary">{activeChallenges.length}/3</Badge>
          </div>
          {activeChallenges.length > 0 ? (
            <div className="space-y-3">
              {activeChallenges.map((userChallenge) => (
                <div key={userChallenge.id} className="border rounded-lg p-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{userChallenge.challenge.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{userChallenge.challenge.pointReward} pts</Badge>
                  </div>
                  <Progress value={userChallenge.progress} className="h-2 mb-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{userChallenge.progress}% complete</span>
                    <Link to="/challenges"><Button size="sm" variant="outline" className="text-xs h-7"><Play className="w-3 h-3 mr-1" />Continue</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Target className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm mb-3">No active challenges</p>
              <Link to="/challenges"><Button size="sm" variant="outline">Browse Challenges</Button></Link>
            </div>
          )}
        </Card>

        {/* Health Overview */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Health Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-slate-700">Symptom Level</span></div>
              <Badge variant="secondary" className="bg-green-100 text-green-600">{healthOverview.symptomLevel}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-slate-700">Mood</span></div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-600">{healthOverview.mood}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span className="text-slate-700">Sleep Quality</span></div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-600">{healthOverview.sleepQuality}/10</Badge>
            </div>
          </div>
        </Card>
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

// Skeleton component for a better loading experience
const DashboardSkeleton = () => (
    <div className="space-y-8 p-4 md:p-6 animate-pulse">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
    </div>
);