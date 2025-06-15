import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BreathingExercise } from "./BreathingExercise";
import { WaterIntakeTracker } from "./WaterIntakeTracker";
import { JournalTracker } from "./JournalTracker";
import { SymptomTracker } from "./SymptomTracker";
import { JourneyTracker } from "./JourneyTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  requirements: any;
  pointReward: number;
}

interface ChallengeTrackerProps {
  challenge: Challenge;
  userChallengeId: string;
}

export function ChallengeTracker({ challenge, userChallengeId }: ChallengeTrackerProps) {
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async ({ progress }: { progress: number }) => {
      return apiRequest("PATCH", `/api/user-challenges/${userChallengeId}/progress`, {
        progress: { completion_percentage: progress }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-challenges"] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/user-challenges/${userChallengeId}/complete`, {
        pointsEarned: challenge.pointReward
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  });

  const handleProgress = (progress: number) => {
    updateProgressMutation.mutate({ progress });
  };

  const handleComplete = () => {
    completeMutation.mutate();
  };

  // Route to appropriate tracker based on challenge requirements
  const renderTracker = () => {
    const req = challenge.requirements;

    // Breathing exercises
    if (req.technique === "breathing" || challenge.title.toLowerCase().includes("breathing")) {
      return (
        <BreathingExercise
          challengeId={challenge.id}
          targetMinutes={req.daily_minutes || req.duration_minutes || 5}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
      );
    }

    // Water intake tracking
    if (req.daily_glasses || challenge.title.toLowerCase().includes("water") || challenge.title.toLowerCase().includes("hydration")) {
      return (
        <WaterIntakeTracker
          challengeId={challenge.id}
          targetGlasses={req.daily_glasses || req.glasses_per_day || 8}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
      );
    }

    // Journal writing
    if (req.daily_words || req.word_count || challenge.title.toLowerCase().includes("journal") || challenge.title.toLowerCase().includes("writing")) {
      return (
        <JournalTracker
          challengeId={challenge.id}
          targetWords={req.daily_words || req.word_count || 100}
          targetDays={req.duration_days || 7}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
      );
    }

    // Journey/reflection tracking
    if (req.reflection_steps || challenge.title.toLowerCase().includes("journey") || challenge.title.toLowerCase().includes("create your")) {
      return (
        <JourneyTracker
          challengeId={challenge.id}
          targetSteps={req.reflection_steps || 5}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
      );
    }

    // Symptom tracking
    if (req.time_of_day || req.consecutive_days || challenge.title.toLowerCase().includes("symptom") || challenge.title.toLowerCase().includes("track")) {
      return (
        <SymptomTracker
          challengeId={challenge.id}
          targetDays={req.consecutive_days || req.duration_days || 3}
          timeOfDay={req.time_of_day || "morning"}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
      );
    }

    // Fallback for challenges without specific tracking
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            {challenge.title}
          </CardTitle>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            This challenge doesn't have an interactive tracker yet.
          </p>
          <p className="text-sm">
            Complete the challenge manually and mark it as done when finished.
          </p>
          <button
            onClick={handleComplete}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Mark as Complete (+{challenge.pointReward} points)
          </button>
        </CardContent>
      </Card>
    );
  };

  return renderTracker();
}