import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  const { isAuthenticated, isLoading } = useAuth();
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
      
      queryClient.invalidateQueries({ queryKey: ["/api/daily-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      
      setTimeout(() => {
        setLocation("/");
      }, 3000);
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
    submitSymptomLog.mutate(formData);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Morning Symptom Log</h2>
            <p className="text-slate-600">Track how you're feeling today</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Overall Feeling */}
          <div>
            <label className="block text-lg font-medium text-slate-800 mb-4">How are you feeling overall?</label>
            <div className="flex items-center gap-4">
              {moodLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, overallFeeling: level.value }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    formData.overallFeeling === level.value
                      ? "border-primary bg-primary-50"
                      : "border-slate-200 hover:border-primary"
                  }`}
                >
                  <div className="text-2xl">{level.emoji}</div>
                  <span className={`text-sm ${
                    formData.overallFeeling === level.value ? "text-primary font-medium" : "text-slate-600"
                  }`}>
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Common Symptoms */}
          <div>
            <label className="block text-lg font-medium text-slate-800 mb-4">Check any symptoms you're experiencing:</label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonSymptoms.map((symptom) => (
                <label key={symptom} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <Checkbox
                    checked={formData.symptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                  />
                  <span className="text-slate-700">{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-lg font-medium text-slate-800 mb-4">Additional notes (optional):</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Describe any other symptoms or how you're feeling..."
              className="h-32 resize-none"
            />
          </div>

          {/* Sleep & Environmental */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-medium text-slate-800 mb-4">Sleep quality last night:</label>
              <Select value={formData.sleepQuality} onValueChange={(value) => setFormData(prev => ({ ...prev, sleepQuality: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very poor</SelectItem>
                  <SelectItem value="2">2 - Poor</SelectItem>
                  <SelectItem value="3">3 - Fair</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-lg font-medium text-slate-800 mb-4">Sun exposure yesterday:</label>
              <Select value={formData.sunExposure} onValueChange={(value) => setFormData(prev => ({ ...prev, sunExposure: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select amount..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="minimal">Minimal (< 30 min)</SelectItem>
                  <SelectItem value="moderate">Moderate (30-60 min)</SelectItem>
                  <SelectItem value="high">High (> 60 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleSubmit}
              disabled={submitSymptomLog.isPending}
              className="px-8 py-3"
            >
              {submitSymptomLog.isPending ? "Saving..." : "Save Log"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="px-8 py-3"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* AI Analysis */}
        {aiInsight && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">AI Insight</h4>
                <p className="text-blue-700 text-sm">{aiInsight}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
