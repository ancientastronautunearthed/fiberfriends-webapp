import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Star, Trophy, Medal, Leaf, MessageCircle } from "lucide-react";

export default function UserProfile() {
  const { user, isAuthenticated, isLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    height: "",
    weight: "",
    location: "",
    diagnosisStatus: "",
    hobbies: "",
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        age: user?.age?.toString() || "",
        height: user?.height || "",
        weight: user?.weight || "",
        location: user?.location || "",
        diagnosisStatus: user?.diagnosisStatus || "",
        hobbies: user?.hobbies || "",
      });
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const updatedData = {
      ...profileData,
      age: profileData.age ? parseInt(profileData.age) : undefined,
    };
    updateProfile.mutate(updatedData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const mockStats = {
    level: user?.level || 1,
    points: user?.totalPoints || 150,
    tier: user?.currentTier || "Newcomer",
    streak: user?.streakDays || 7,
    longestStreak: user?.longestStreak || 14,
    badges: [
      { name: "Early Bird", icon: "🌅", description: "Logged symptoms for 7 consecutive days" },
      { name: "Community Helper", icon: "🤝", description: "Helped 5 community members" },
      { name: "Wellness Warrior", icon: "💪", description: "Completed 30 daily check-ins" },
    ],
    achievements: [
      { name: "First Log", date: "2024-01-15", description: "Completed your first symptom log" },
      { name: "Week Warrior", date: "2024-01-22", description: "Logged symptoms for 7 consecutive days" },
      { name: "Community Contributor", date: "2024-02-01", description: "Made your first community post" },
    ]
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">User Profile</h1>
        <p className="text-slate-600">
          Manage your personal information and view your progress
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="progress">Progress & Stats</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-slate-600">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Level {mockStats.level} • {mockStats.tier}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">First Name</label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Last Name</label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Age</label>
                  <Input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter your age"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Height</label>
                  <Input
                    value={profileData.height}
                    onChange={(e) => setProfileData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="e.g. 5'6&quot;"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Weight</label>
                  <Input
                    value={profileData.weight}
                    onChange={(e) => setProfileData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="e.g. 150 lbs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Diagnosis Status</label>
                <Select
                  value={profileData.diagnosisStatus}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, diagnosisStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your diagnosis status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnosed">Formally Diagnosed</SelectItem>
                    <SelectItem value="self-diagnosed">Self-Diagnosed</SelectItem>
                    <SelectItem value="suspected">Suspected</SelectItem>
                    <SelectItem value="exploring">Still Exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Hobbies & Interests</label>
                <Textarea
                  value={profileData.hobbies}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hobbies: e.target.value }))}
                  placeholder="Tell us about your hobbies, interests, or anything that brings you joy..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={updateProfile.isPending}
                className="w-full"
              >
                {updateProfile.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{mockStats.points}</div>
                <div className="text-sm text-slate-600">Total Points</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">Level {mockStats.level}</div>
                <div className="text-sm text-slate-600">{mockStats.tier}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Leaf className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{mockStats.streak}</div>
                <div className="text-sm text-slate-600">Day Streak</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Medal className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{mockStats.badges.length}</div>
                <div className="text-sm text-slate-600">Badges Earned</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockStats.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <div className="font-medium text-slate-900">{badge.name}</div>
                      <div className="text-sm text-slate-600">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Achievement History</h3>
              <div className="space-y-4">
                {mockStats.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{achievement.name}</div>
                      <div className="text-sm text-slate-600">{achievement.description}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Earned on {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}