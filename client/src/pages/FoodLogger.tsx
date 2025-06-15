import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Utensils, Brain, Sun, CloudSun, Moon, Cookie } from "lucide-react";
import { useLocation } from "wouter";

export default function FoodLogger() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    mealType: "breakfast",
    foodDescription: "",
    supplements: [] as string[],
    otherSupplements: "",
  });

  const [nutritionalAnalysis, setNutritionalAnalysis] = useState<any>(null);

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

  const mealTypes = [
    { value: "breakfast", label: "Breakfast", icon: Sun },
    { value: "lunch", label: "Lunch", icon: CloudSun },
    { value: "dinner", label: "Dinner", icon: Moon },
    { value: "snack", label: "Snack", icon: Cookie },
  ];

  const commonSupplements = [
    "Vitamin D",
    "Omega-3",
    "Probiotics",
    "Magnesium",
    "Vitamin C",
    "B-Complex",
    "Zinc",
    "Iron",
  ];

  const submitFoodLog = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/daily-logs", {
        logType: "food",
        data,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Meal logged successfully!",
        description: "AI nutritional analysis is ready.",
      });
      
      setNutritionalAnalysis(data.nutritionalAnalysis);
      queryClient.invalidateQueries({ queryKey: ["/api/daily-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
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
        description: "Failed to log meal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSupplementToggle = (supplement: string) => {
    setFormData(prev => ({
      ...prev,
      supplements: prev.supplements.includes(supplement)
        ? prev.supplements.filter(s => s !== supplement)
        : [...prev.supplements, supplement]
    }));
  };

  const handleSubmit = () => {
    if (!formData.foodDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please describe what you ate.",
        variant: "destructive",
      });
      return;
    }
    
    submitFoodLog.mutate(formData);
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
          <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Food & Nutrition Log</h2>
            <p className="text-slate-600">Track your meals and supplements</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Meal Type */}
          <div>
            <label className="block text-lg font-medium text-slate-800 mb-4">Meal type:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mealTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mealType: type.value }))}
                    className={`p-4 rounded-lg border-2 font-medium transition-colors ${
                      formData.mealType === type.value
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-slate-200 text-slate-600 hover:border-primary"
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Food Description */}
          <div>
            <label className="block text-lg font-medium text-slate-800 mb-4">What did you eat?</label>
            <Textarea
              value={formData.foodDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, foodDescription: e.target.value }))}
              placeholder="Describe your meal in detail... (e.g., 'Scrambled eggs with spinach, whole grain toast with avocado, and a cup of green tea')"
              className="h-32 resize-none"
            />
            <p className="text-sm text-slate-500 mt-2">Be as specific as possible for better AI analysis</p>
          </div>

          {/* Supplements */}
          <div>
            <label className="block text-lg font-medium text-slate-800 mb-4">Supplements taken:</label>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {commonSupplements.map((supplement) => (
                <label key={supplement} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <Checkbox
                    checked={formData.supplements.includes(supplement)}
                    onCheckedChange={() => handleSupplementToggle(supplement)}
                  />
                  <span className="text-slate-700">{supplement}</span>
                </label>
              ))}
            </div>
            <Input
              value={formData.otherSupplements}
              onChange={(e) => setFormData(prev => ({ ...prev, otherSupplements: e.target.value }))}
              placeholder="Other supplements..."
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleSubmit}
              disabled={submitFoodLog.isPending}
              className="bg-secondary hover:bg-secondary/90 px-8 py-3"
            >
              {submitFoodLog.isPending ? "Analyzing..." : "Analyze Meal"}
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

        {/* AI Nutritional Analysis */}
        {nutritionalAnalysis && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-800 mb-2">AI Nutritional Analysis</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded">
                    <span className="text-sm text-slate-600">Estimated Calories</span>
                    <p className="text-lg font-semibold text-slate-800">{nutritionalAnalysis.calories} kcal</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <span className="text-sm text-slate-600">Protein</span>
                    <p className="text-lg font-semibold text-slate-800">{nutritionalAnalysis.protein}g</p>
                  </div>
                </div>
                <p className="text-green-700 text-sm">{nutritionalAnalysis.critique}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
