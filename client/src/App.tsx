import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import LunaCreation from "@/pages/LunaCreation";
import Dashboard from "@/pages/Dashboard";
import SymptomTracker from "@/pages/SymptomTracker";
import SymptomWheel from "@/pages/SymptomWheel";
import SymptomPatterns from "@/pages/SymptomPatterns";
import FoodLogger from "@/pages/FoodLogger";
import CommunityForum from "@/pages/CommunityForum";
import SimplifiedChat from "@/pages/SimplifiedChat";
import AICompanion from "@/pages/AICompanion";
import UserProfile from "@/pages/UserProfile";
import TestChat from "@/pages/TestChat";
import Challenges from "@/pages/Challenges";
import Achievements from "@/pages/Achievements";
import Recommendations from "@/pages/Recommendations";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Show onboarding for authenticated users who haven't completed their profile
  if (user && !user.onboardingCompleted) {
    return <Onboarding />;
  }

  // Show main app for authenticated users with completed profiles
  return (
    <Switch>
      <Layout>
        <Route path="/" component={AICompanion} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/tracking" component={SymptomTracker} />
        <Route path="/symptom-wheel" component={SymptomWheel} />
        <Route path="/patterns" component={SymptomPatterns} />
        <Route path="/food" component={FoodLogger} />
        <Route path="/community" component={CommunityForum} />
        <Route path="/chat" component={SimplifiedChat} />
        <Route path="/test-chat" component={TestChat} />
        <Route path="/companion" component={AICompanion} />
        <Route path="/challenges" component={Challenges} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/profile" component={UserProfile} />
      </Layout>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
