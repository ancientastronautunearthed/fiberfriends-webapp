]import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck, Brain } from "lucide-react";
import { useLocation } from "wouter";

export default function SymptomTracker() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    overallFeeling: 3,
    symptoms: [] as string[],
    notes: "",
    sleepQuality: "",
    sunExposure: "",
  });

  const [aiInsight, setAiInsight] = useState("");

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

  const moodLevels = [
    { value: 1, emoji: "😢", label: "Poor" },
    { value: 2, emoji: "😕", label: "Fair" },
    { value: 3, emoji: "😊", label: "Good" },
    { value: 4, emoji: "😄", label: "Great" },
  ];

  const commonSymptoms = [
    "Skin irritation",
    "Fatigue",
    "Joint pain",
    "Headache",
    "Brain fog",
    "Sleep issues",
    "Digestive issues",
    "Muscle aches",
    "Mood changes",
    "Concentration problems",
  ];

  const submitSymptomLog = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/daily-logs", {
        logType: "symptoms",
        data,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Symptom log saved!",
        description: "Your symptoms have been recorded successfully.",
      });
      
      // Mock AI insight
      setAiInsight("Your symptoms appear to be stable compared to last week. Consider maintaining your current routine and tracking any patterns you notice. Your improved sleep quality may be contributing to better overall well-being.");
      
      // Reset form
      setFormData({
        overallFeeling: 3,
        symptoms: [],
        notes: "",
        sleepQuality: "",
        sunExposure: "",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/daily-logs"] });
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
        description: "Failed to save symptom log. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = () => {
    if (formData.symptoms.length === 0) {
      toast({
        title: "Please select symptoms",
        description: "You must select at least one symptom to track.",
        variant: "destructive",
      });
      return;
    }

    submitSymptomLog.mutate(formData);
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

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Symptom Tracker</h1>
        <p className="text-slate-600">
          Log your daily symptoms to help identify patterns and track progress
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Overall Feeling */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">How are you feeling overall today?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {moodLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setFormData(prev => ({ ...prev, overallFeeling: level.value }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.overallFeeling === level.value
                    ? "border-primary bg-primary/10"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-3xl mb-2">{level.emoji}</div>
                <div className="text-sm font-medium">{level.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Which symptoms are you experiencing?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonSymptoms.map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  id={symptom}
                  checked={formData.symptoms.includes(symptom)}
                  onCheckedChange={() => handleSymptomToggle(symptom)}
                />
                <label
                  htmlFor={symptom}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {symptom}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">How was your sleep quality?</h3>
          <Select value={formData.sleepQuality} onValueChange={(value) => setFormData(prev => ({ ...prev, sleepQuality: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select sleep quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent - Refreshed and energized</SelectItem>
              <SelectItem value="good">Good - Fairly rested</SelectItem>
              <SelectItem value="fair">Fair - Some rest but not ideal</SelectItem>
              <SelectItem value="poor">Poor - Restless or insufficient</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sun Exposure */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Sun exposure today</h3>
          <Select value={formData.sunExposure} onValueChange={(value) => setFormData(prev => ({ ...prev, sunExposure: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select sun exposure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None - Stayed indoors</SelectItem>
              <SelectItem value="minimal">Minimal - Brief outdoor time</SelectItem>
              <SelectItem value="moderate">Moderate - Several hours outside</SelectItem>
              <SelectItem value="high">High - Most of the day outdoors</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Additional notes</h3>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional observations, triggers, or patterns you noticed today..."
            rows={4}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={submitSymptomLog.isPending}
          className="w-full"
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          {submitSymptomLog.isPending ? "Saving..." : "Log Symptoms"}
        </Button>
      </Card>

      {/* AI Insight */}
      {aiInsight && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-900">AI Health Insight</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">{aiInsight}</p>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setLocation("/patterns")} className="flex-1">
          View Patterns
        </Button>
        <Button variant="outline" onClick={() => setLocation("/food-logger")} className="flex-1">
          Log Food
        </Button>
      </div>
    </div>
  );
}