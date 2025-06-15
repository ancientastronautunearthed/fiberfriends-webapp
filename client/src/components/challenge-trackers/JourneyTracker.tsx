import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Target, Star, CheckCircle } from "lucide-react";

interface JourneyTrackerProps {
  challengeId: string;
  targetSteps: number;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  reflection?: string;
}

export function JourneyTracker({ challengeId, targetSteps, onProgress, onComplete }: JourneyTrackerProps) {
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [currentReflection, setCurrentReflection] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  // Initialize journey steps
  useEffect(() => {
    const journeySteps: JourneyStep[] = [
      {
        id: 1,
        title: "Set Your Intention",
        description: "Define what you want to achieve with your health journey today.",
        completed: false
      },
      {
        id: 2,
        title: "Identify Your Focus",
        description: "Choose one specific area of your health to prioritize.",
        completed: false
      },
      {
        id: 3,
        title: "Plan Your Action",
        description: "Write down one concrete step you'll take today.",
        completed: false
      },
      {
        id: 4,
        title: "Commit to Growth",
        description: "Reflect on how this step will contribute to your overall wellness.",
        completed: false
      },
      {
        id: 5,
        title: "Celebrate Progress",
        description: "Acknowledge the effort you're putting into your health journey.",
        completed: false
      }
    ];
    setSteps(journeySteps);
  }, []);

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleStepComplete = (stepId: number, reflection: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, completed: true, reflection }
        : step
    ));

    const newCompletedCount = completedSteps + 1;
    const newProgress = (newCompletedCount / steps.length) * 100;
    
    onProgress(newProgress);
    
    if (newCompletedCount === steps.length) {
      onComplete();
    } else {
      setActiveStep(stepId);
      setCurrentReflection("");
    }
  };

  const currentStep = steps[activeStep];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Your Health Journey</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete {steps.length} reflection steps to map your path forward
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Journey Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedSteps}/{steps.length} steps
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Journey Steps Overview */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
              step.completed
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : index === activeStep
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            }`}
            onClick={() => !step.completed && setActiveStep(index)}
          >
            <div className="text-center">
              {step.completed ? (
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
              ) : index === activeStep ? (
                <Target className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              ) : (
                <Star className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              )}
              <div className="text-xs font-medium truncate">{step.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Step Detail */}
      {currentStep && !currentStep.completed && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Step {activeStep + 1}: {currentStep.title}
            </h4>
            <p className="text-muted-foreground mb-4">{currentStep.description}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Reflection:
                </label>
                <Textarea
                  value={currentReflection}
                  onChange={(e) => setCurrentReflection(e.target.value)}
                  placeholder="Take a moment to reflect on this step..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <Button
                onClick={() => handleStepComplete(currentStep.id, currentReflection)}
                disabled={currentReflection.trim().length < 10}
                className="w-full"
              >
                Complete Step {activeStep + 1}
              </Button>
              
              {currentReflection.trim().length < 10 && currentReflection.length > 0 && (
                <p className="text-sm text-amber-600">
                  Please write at least 10 characters for your reflection.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Steps Summary */}
      {completedSteps > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completed Reflections
            </h4>
            <div className="space-y-3">
              {steps
                .filter(step => step.completed)
                .map(step => (
                  <div key={step.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-medium text-sm text-green-800 dark:text-green-200">
                      {step.title}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {step.reflection}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Message */}
      {completedSteps === steps.length && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              Journey Complete!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              You've successfully reflected on your health journey and set your path forward.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}