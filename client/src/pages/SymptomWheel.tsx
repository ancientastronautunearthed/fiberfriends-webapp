import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SymptomTrackingWheel } from "@/components/SymptomTrackingWheel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from "lucide-react";

export default function SymptomWheel() {
  const [notes, setNotes] = useState("");
  const [wheelData, setWheelData] = useState<any>(null);
  const { toast } = useToast();

  // Fetch symptom wheel entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/symptom-wheel-entries"],
  });

  // Fetch analytics data
  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/symptom-wheel-analytics"],
  });

  // Save symptom wheel entry
  const saveEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/symptom-wheel-entries", data);
    },
    onSuccess: () => {
      toast({
        title: "Entry Saved",
        description: "Your symptom tracking has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/symptom-wheel-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/symptom-wheel-analytics"] });
      setNotes("");
      setWheelData(null);
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Unable to save your symptom tracking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleWheelDataChange = (data: any) => {
    setWheelData(data);
  };

  const handleSaveEntry = () => {
    if (!wheelData || !wheelData.symptoms || wheelData.symptoms.length === 0) {
      toast({
        title: "No Data to Save",
        description: "Please track some symptoms before saving.",
        variant: "destructive",
      });
      return;
    }

    const totalSymptoms = wheelData.symptoms.length;
    const averageIntensity = wheelData.symptoms.reduce((sum: number, s: any) => sum + s.intensity, 0) / totalSymptoms;
    const moodScore = wheelData.overallMood || 5;

    saveEntryMutation.mutate({
      entryDate: new Date().toISOString(),
      symptomData: wheelData.symptoms,
      totalSymptoms,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      notes: notes.trim() || null,
      moodScore,
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Symptoms increasing';
      case 'decreasing':
        return 'Symptoms improving';
      default:
        return 'Symptoms stable';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Tracking Wheel</h1>
          <p className="text-gray-600">
            Track your symptoms with our interactive color-coded wheel. Click on segments to adjust intensity levels and visualize your health patterns.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Interface */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Track Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SymptomTrackingWheel onDataChange={handleWheelDataChange} />
                
                {wheelData && wheelData.symptoms && wheelData.symptoms.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (optional)
                      </label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any additional notes about your symptoms, triggers, or how you're feeling..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSaveEntry}
                      disabled={saveEntryMutation.isPending}
                      className="w-full"
                    >
                      {saveEntryMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analytics Panel */}
          <div className="space-y-6">
            {/* Current Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Entries</span>
                      <span className="font-semibold">{analytics.totalEntries || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. Intensity</span>
                      <span className="font-semibold">{analytics.averageIntensity || 0}/10</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. Mood</span>
                      <span className="font-semibold">{analytics.averageMoodScore || 0}/10</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Trend</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(analytics.intensityTrend)}
                        <span className="text-sm font-medium">
                          {getTrendText(analytics.intensityTrend)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Most Common Symptoms */}
            {analytics.mostCommonSymptoms && analytics.mostCommonSymptoms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Frequent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.mostCommonSymptoms.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {item.symptom.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium">{item.count}x</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entriesLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : entries.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No entries yet. Start tracking your symptoms!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {entries.slice(0, 5).map((entry: any) => (
                      <div key={entry.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {entry.totalSymptoms} symptoms
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.entryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Intensity: {entry.averageIntensity}/10</span>
                          <span>Mood: {entry.moodScore}/10</span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}