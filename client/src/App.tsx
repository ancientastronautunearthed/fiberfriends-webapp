import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import SymptomTracker from "@/pages/SymptomTracker";
import SymptomPatterns from "@/pages/SymptomPatterns";
import FoodLogger from "@/pages/FoodLogger";
import CommunityForum from "@/pages/CommunityForum";
import SimplifiedChat from "@/pages/SimplifiedChat";
import AICompanion from "@/pages/AICompanion";
import UserProfile from "@/pages/UserProfile";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useFirebaseAuth();

  // Always show the authenticated routes for testing the chat system
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Layout>
        <Route path="/" component={Dashboard} />
        <Route path="/tracking" component={SymptomTracker} />
        <Route path="/patterns" component={SymptomPatterns} />
        <Route path="/food" component={FoodLogger} />
        <Route path="/community" component={CommunityForum} />
        <Route path="/chat" component={SimplifiedChat} />
        <Route path="/companion" component={AICompanion} />
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
