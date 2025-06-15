import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { createDailySymptomLog, awardPoints, submitAnonymizedResearchData } from "@/lib/firestore";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Brain, Zap, Moon } from "lucide-react";
import { useLocation } from "wouter";

const commonSymptoms = [
  "Skin crawling sensations",
  "Fiber-like material on skin",
  "Fatigue",
  "Joint pain",
  "Muscle aches",
  "Brain fog",
  "Sleep disturbances",
  "Digestive issues",
  "Mood changes",
  "Skin lesions",
  "Itching",
  "Burning sensations"
];

export default function DailySymptomPrompt() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState([5]);
  const [energy, setEnergy] = useState([5]);
  const [pain, setPain] = useState([5]);
  const [sleep, setSleep] = useState([5]);
  const [notes, setNotes] = useState("");
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to submit your symptoms.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare symptom data
      const symptomData = {
        symptoms: selectedSymptoms,
        mood: mood[0],
        energy: energy[0],
        pain: pain[0],
        sleep: sleep[0],
        notes,
        timestamp: new Date().toISOString()
      };

      // Submit daily symptom log to Firestore
      await createDailySymptomLog(user.id, symptomData);

      // Award points for daily logging
      await awardPoints(user.id, "daily_symptom_log", 10, "Completed daily symptom log");

      // Submit anonymized research data
      const anonymizedData = {
        demographic: {
          ageRange: user.ageRange || "not_specified",
          location: user.location || "not_specified"
        },
        symptoms: selectedSymptoms,
        metrics: {
          mood: mood[0],
          energy: energy[0],
          pain: pain[0],
          sleep: sleep[0]
        },
        entryDate: new Date().toISOString().split('T')[0],
        qualityScore: selectedSymptoms.length > 0 ? 85 : 60
      };
      
      await submitAnonymizedResearchData(user.id, anonymizedData);

      toast({
        title: "Symptom Log Submitted",
        description: "Your daily symptoms have been recorded successfully and contributed to research.",
      });

      // Navigate to AI Companion
      setLocation("/ai-companion");

    } catch (error) {
      console.error("Error submitting symptom log:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your symptom log. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsGeneratingTasks(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-gray-900">Good Morning!</h1>
          <p className="text-lg text-gray-600">
            Let's start your day by checking in on how you're feeling.
          </p>
          <p className="text-sm text-gray-500">
            This helps Luna create your personalized daily activity plan.
          </p>
        </div>

        {/* Main Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Daily Symptom Check-In
            </CardTitle>
            <CardDescription>
              Take a moment to reflect on how you're feeling today. Your honest input helps us provide better support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Symptoms */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Which symptoms are you experiencing today?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonSymptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => handleSymptomToggle(symptom)}
                    />
                    <Label
                      htmlFor={symptom}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Mood (1 = Very Low, 10 = Excellent)
              </Label>
              <div className="px-3">
                <Slider
                  value={mood}
                  onValueChange={setMood}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-medium">Current: {mood[0]}</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Energy Level (1 = Exhausted, 10 = Very Energetic)
              </Label>
              <div className="px-3">
                <Slider
                  value={energy}
                  onValueChange={setEnergy}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-medium">Current: {energy[0]}</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Pain */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Pain Level (1 = No Pain, 10 = Severe Pain)
              </Label>
              <div className="px-3">
                <Slider
                  value={pain}
                  onValueChange={setPain}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-medium">Current: {pain[0]}</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Sleep */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-500" />
                Sleep Quality Last Night (1 = Very Poor, 10 = Excellent)
              </Label>
              <div className="px-3">
                <Slider
                  value={sleep}
                  onValueChange={setSleep}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-medium">Current: {sleep[0]}</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-base font-medium">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any specific concerns, patterns you've noticed, or how you're feeling overall..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isGeneratingTasks}
              className="w-full h-12 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : isGeneratingTasks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Luna is preparing your daily tasks...
                </>
              ) : (
                "Submit & Get My Daily Tasks"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Encouragement */}
        <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-gray-700">
              🌟 Thank you for taking care of yourself! Your daily check-ins help us understand your patterns and provide better support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}