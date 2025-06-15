import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState([5]);
  const [energy, setEnergy] = useState([5]);
  const [pain, setPain] = useState([5]);
  const [sleep, setSleep] = useState([5]);
  const [notes, setNotes] = useState("");

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "Please select symptoms",
        description: "Select at least one symptom or choose 'No symptoms today'",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Store symptom log locally for demo purposes
      const logData = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        symptoms: selectedSymptoms,
        mood: mood[0],
        energy: energy[0],
        pain: pain[0],
        sleep: sleep[0],
        notes,
        timestamp: new Date().toISOString(),
        userId: 'demo-user'
      };

      // Store in localStorage for persistence
      const existingLogs = JSON.parse(localStorage.getItem('daily-logs') || '[]');
      const updatedLogs = [logData, ...existingLogs.slice(0, 9)]; // Keep last 10 logs
      localStorage.setItem('daily-logs', JSON.stringify(updatedLogs));
      
      // Mark today as logged
      localStorage.setItem('last-symptom-log-date', new Date().toISOString().split('T')[0]);

      toast({
        title: "Symptom log recorded!",
        description: "Your daily health data has been saved successfully.",
      });

      // Redirect to dashboard
      setTimeout(() => {
        setLocation('/');
      }, 1000);

    } catch (error) {
      console.error('Error saving symptom log:', error);
      toast({
        title: "Error saving log",
        description: "There was an issue saving your symptom log. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              <div className="flex items-center space-x-2 mt-3">
                <Checkbox
                  id="no-symptoms"
                  checked={selectedSymptoms.includes("No symptoms today")}
                  onCheckedChange={() => handleSymptomToggle("No symptoms today")}
                />
                <Label
                  htmlFor="no-symptoms"
                  className="text-sm font-medium cursor-pointer text-green-700"
                >
                  No symptoms today
                </Label>
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
                Energy Level (1 = Exhausted, 10 = Energetic)
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
                Pain Level (1 = No Pain, 10 = Severe)
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
                Sleep Quality (1 = Poor, 10 = Excellent)
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
              <Label className="text-base font-medium">Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Any additional observations about your symptoms or how you're feeling today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording Symptoms...
                </>
              ) : (
                "Record Daily Symptoms"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now - Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}