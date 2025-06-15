import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  options: string[];
  selectedOption?: string;
  customText?: string;
}

export function JourneyTracker({ challengeId, targetSteps, onProgress, onComplete }: JourneyTrackerProps) {
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [customText, setCustomText] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  // Initialize journey steps with multiple choice options
  useEffect(() => {
    const journeySteps: JourneyStep[] = [
      {
        id: 1,
        title: "Set Your Intention",
        description: "Define what you want to achieve with your health journey today.",
        completed: false,
        options: [
          "Improve my overall energy levels",
          "Better manage my symptoms",
          "Build healthier daily habits",
          "Strengthen my mental wellbeing",
          "Connect more with my body's needs"
        ]
      },
      {
        id: 2,
        title: "Identify Your Focus",
        description: "Choose one specific area of your health to prioritize.",
        completed: false,
        options: [
          "Physical symptoms and tracking",
          "Nutrition and meal planning",
          "Sleep quality and rest",
          "Stress management and relaxation",
          "Social support and community"
        ]
      },
      {
        id: 3,
        title: "Plan Your Action",
        description: "Write down one concrete step you'll take today.",
        completed: false,
        options: [
          "Log my symptoms at three specific times",
          "Prepare a nourishing meal mindfully",
          "Practice 10 minutes of deep breathing",
          "Take a gentle walk outside",
          "Reach out to a supportive friend or family member"
        ]
      },
      {
        id: 4,
        title: "Commit to Growth",
        description: "Reflect on how this step will contribute to your overall wellness.",
        completed: false,
        options: [
          "This will help me understand my patterns better",
          "This supports my body's healing process",
          "This builds my confidence in self-care",
          "This creates positive momentum for tomorrow",
          "This honors my commitment to myself"
        ]
      },
      {
        id: 5,
        title: "Celebrate Progress",
        description: "Acknowledge the effort you're putting into your health journey.",
        completed: false,
        options: [
          "I'm proud of taking this step for my health",
          "Every small action matters in my journey",
          "I'm learning to listen to my body better",
          "I deserve to feel good and take care of myself",
          "Progress isn't always perfect, and that's okay"
        ]
      }
    ];
    setSteps(journeySteps);
  }, []);

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleStepComplete = (stepId: number, option: string, custom: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, completed: true, selectedOption: option, customText: custom }
        : step
    ));

    const newCompletedCount = completedSteps + 1;
    const newProgress = (newCompletedCount / steps.length) * 100;
    
    onProgress(newProgress);
    
    if (newCompletedCount === steps.length) {
      onComplete();
    } else {
      setActiveStep(stepId);
      setSelectedOption("");
      setCustomText("");
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
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Choose an option that resonates with you:
                </label>
                <RadioGroup 
                  value={selectedOption} 
                  onValueChange={setSelectedOption}
                  className="space-y-3"
                >
                  {currentStep.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={option} 
                        id={`option-${index}`}
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={`option-${index}`}
                        className="text-sm leading-relaxed cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem 
                      value="custom" 
                      id="custom-option"
                      className="mt-1"
                    />
                    <Label 
                      htmlFor="custom-option"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Custom response:
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {selectedOption === "custom" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Write your own reflection:
                  </label>
                  <Textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Share your personal thoughts on this step..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}
              
              <Button
                onClick={() => handleStepComplete(
                  currentStep.id, 
                  selectedOption === "custom" ? "Custom" : selectedOption,
                  selectedOption === "custom" ? customText : selectedOption
                )}
                disabled={
                  !selectedOption || 
                  (selectedOption === "custom" && customText.trim().length < 10)
                }
                className="w-full"
              >
                Complete Step {activeStep + 1}
              </Button>
              
              {selectedOption === "custom" && customText.trim().length < 10 && customText.length > 0 && (
                <p className="text-sm text-amber-600">
                  Please write at least 10 characters for your custom reflection.
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
                      {step.selectedOption === "Custom" ? step.customText : step.selectedOption}
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