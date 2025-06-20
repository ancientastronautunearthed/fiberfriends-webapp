import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import LunaCreation from "@/pages/LunaCreation";
import Dashboard from "@/pages/Dashboard";
import DailySymptomPrompt from "@/pages/DailySymptomPrompt";
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
import HealthyActivities from "@/pages/HealthyActivities";
import TestLuna from "@/pages/TestLuna";
import CommunityInsights from "@/pages/CommunityInsights";
import EnvironmentalTriggers from "@/pages/EnvironmentalTriggers";
import Layout from "@/components/Layout";

function Router() {
  const authData = useFirebaseAuth();
  const { user, isLoading, isAuthenticated } = authData || { user: null, isLoading: true, isAuthenticated: false };

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

  // Show main app for authenticated users - directly go to dashboard/main app
  // Removed the symptom log requirement that was blocking access
  return (
      <Layout>
        <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/ai-companion" component={AICompanion} />
            <Route
              path="/luna-creation"
              component={() => (
                <LunaCreation
                  onComplete={() => {
                    // handle completion, e.g., redirect or update state
                  }}
                  onBack={() => {
                    // handle back navigation, e.g., history.back() or similar
                  }}
                />
              )}
            />
            <Route path="/daily-symptom-prompt" component={DailySymptomPrompt} />
            <Route path="/symptom-tracker" component={SymptomTracker} />
            <Route path="/symptom-wheel" component={SymptomWheel} />
            <Route path="/symptom-patterns" component={SymptomPatterns} />
            <Route path="/food-logger" component={FoodLogger} />
            <Route path="/community" component={CommunityForum} />
            <Route path="/simplified-chat" component={SimplifiedChat} />
            <Route path="/profile" component={UserProfile} />
            <Route path="/test-chat" component={TestChat} />
            <Route path="/challenges" component={Challenges} />
            <Route path="/achievements" component={Achievements} />
            <Route path="/recommendations" component={Recommendations} />
            <Route path="/healthy-activities" component={HealthyActivities} />
            <Route path="/test-luna" component={TestLuna} />
            <Route path="/community-insights" component={CommunityInsights} />
            <Route path="/environmental-triggers" component={EnvironmentalTriggers} />
          
        </Switch>
      </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Router />
          <Toaster />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;