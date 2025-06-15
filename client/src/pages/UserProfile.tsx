import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, isAuthenticated, isLoading } = useAuth();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      ...profileData,
      age: profileData.age ? parseInt(profileData.age) : null,
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const trophies = [
    {
      id: 1,
      name: "Consistency Champion",
      description: "7 days of complete logs",
      earned: "3 days ago",
      icon: Medal,
      bgColor: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      iconColor: "bg-yellow-500"
    },
    {
      id: 2,
      name: "Nutrition Expert",
      description: "Perfect nutrition week",
      earned: "1 week ago",
      icon: Leaf,
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      iconColor: "bg-green-500"
    },
    {
      id: 3,
      name: "Community Helper",
      description: "10 helpful forum replies",
      earned: "2 weeks ago",
      icon: MessageCircle,
      bgColor: "from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
      iconColor: "bg-purple-500"
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-slate-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || "User Profile"}
            </h2>
            <p className="text-slate-600">{user?.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-slate-800">{user?.points || 0} points</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-slate-600">{trophies.length} trophies</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="health">Health Data</TabsTrigger>
            <TabsTrigger value="trophies">Trophy Case</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                  <Input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Height</label>
                  <Input
                    value={profileData.height}
                    onChange={(e) => setProfileData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="e.g., 5'6&quot;"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Weight</label>
                  <Input
                    value={profileData.weight}
                    onChange={(e) => setProfileData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="e.g., 140 lbs"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Diagnosis Status</label>
                  <Select value={profileData.diagnosisStatus} onValueChange={(value) => setProfileData(prev => ({ ...prev, diagnosisStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suspected">Suspected</SelectItem>
                      <SelectItem value="diagnosed">Diagnosed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hobbies & Interests</label>
                <Textarea
                  value={profileData.hobbies}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hobbies: e.target.value }))}
                  placeholder="Tell us about your interests..."
                  className="h-24 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={updateProfile.isPending} className="px-8 py-3">
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" className="px-8 py-3">
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="health" className="mt-8">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">Health Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Diagnosis Status:</span>
                      <span className="font-medium">{user?.diagnosisStatus || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Logs:</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Streak:</span>
                      <span className="font-medium">7 days</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">Recent Trends</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Average Mood:</span>
                      <span className="font-medium text-green-600">Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sleep Quality:</span>
                      <span className="font-medium text-blue-600">Improving</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Symptom Level:</span>
                      <span className="font-medium text-green-600">Stable</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trophies" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6">
              {trophies.map((trophy) => {
                const Icon = trophy.icon;
                return (
                  <div key={trophy.id} className={`text-center p-6 bg-gradient-to-b ${trophy.bgColor} rounded-lg border ${trophy.borderColor}`}>
                    <div className={`w-16 h-16 ${trophy.iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">{trophy.name}</h4>
                    <p className="text-sm text-slate-600 mb-1">{trophy.description}</p>
                    <span className="text-xs text-slate-500">Earned {trophy.earned}</span>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
