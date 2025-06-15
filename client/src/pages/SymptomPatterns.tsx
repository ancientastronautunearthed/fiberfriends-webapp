import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Target,
  Brain,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  detectCyclicalPatterns, 
  detectTrends, 
  identifyTriggers,
  calculateCorrelation,
  generatePatternInsights,
  type SymptomData
} from "@/lib/symptomAnalytics";

export default function SymptomPatterns() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Redirect if not authenticated
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

  // Fetch user's symptom logs
  const { data: symptomLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/daily-logs", "symptoms"],
    enabled: isAuthenticated,
  });

  // Fetch existing patterns
  const { data: existingPatterns } = useQuery({
    queryKey: ["/api/symptom-patterns"],
    enabled: isAuthenticated,
  });

  // Run pattern analysis
  const analyzePatterns = async () => {
    if (!symptomLogs || symptomLogs.length < 7) {
      toast({
        title: "Insufficient Data",
        description: "Need at least 7 days of symptom logs to analyze patterns.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert logs to SymptomData format
      const symptomData: SymptomData[] = symptomLogs
        .filter((log: any) => log.logType === 'symptoms')
        .flatMap((log: any) => {
          const data = log.data;
          return Object.entries(data.symptoms || {}).map(([symptom, severity]) => ({
            symptom,
            severity: Number(severity),
            timestamp: new Date(log.date),
            contextFactors: data.contextFactors || []
          }));
        });

      // Group by symptom type
      const symptomGroups = symptomData.reduce((groups, data) => {
        if (!groups[data.symptom]) groups[data.symptom] = [];
        groups[data.symptom].push(data);
        return groups;
      }, {} as Record<string, SymptomData[]>);

      const results: any = {
        patterns: {},
        trends: {},
        correlations: [],
        triggers: [],
        insights: []
      };

      // Analyze each symptom
      for (const [symptom, data] of Object.entries(symptomGroups)) {
        if (data.length >= 7) {
          results.patterns[symptom] = detectCyclicalPatterns(data);
          results.trends[symptom] = detectTrends(data);
        }
      }

      // Calculate correlations between symptoms
      const symptoms = Object.keys(symptomGroups);
      for (let i = 0; i < symptoms.length; i++) {
        for (let j = i + 1; j < symptoms.length; j++) {
          const symptom1 = symptoms[i];
          const symptom2 = symptoms[j];
          const correlation = calculateCorrelation(
            symptomGroups[symptom1], 
            symptomGroups[symptom2]
          );
          
          if (Math.abs(correlation) > 0.3) {
            results.correlations.push({
              primarySymptom: symptom1,
              correlatedSymptom: symptom2,
              correlationStrength: Math.round(correlation * 100),
              occurrenceCount: Math.min(symptomGroups[symptom1].length, symptomGroups[symptom2].length)
            });
          }
        }
      }

      // Identify triggers across all symptoms
      results.triggers = identifyTriggers(symptomData);

      // Generate AI insights
      const allPatterns = Object.values(results.patterns).flat();
      const allTrends = Object.values(results.trends).flat();
      results.insights = await generatePatternInsights(
        allPatterns,
        allTrends,
        results.triggers,
        results.correlations
      );

      setAnalysisData(results);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${results.insights.length} insights and ${results.correlations.length} correlations.`,
      });

    } catch (error) {
      console.error('Pattern analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze patterns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Symptom Pattern Analysis</h1>
          <p className="text-slate-600 mt-2">
            Discover patterns, trends, and correlations in your health data
          </p>
        </div>
        <Button 
          onClick={analyzePatterns} 
          disabled={isAnalyzing || !symptomLogs || symptomLogs.length < 7}
          className="flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          {isAnalyzing ? "Analyzing..." : "Analyze Patterns"}
        </Button>
      </div>

      {/* Data Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {symptomLogs?.filter((log: any) => log.logType === 'symptoms').length || 0}
              </div>
              <div className="text-sm text-slate-600">Symptom Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {existingPatterns?.length || 0}
              </div>
              <div className="text-sm text-slate-600">Known Patterns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {analysisData?.insights?.length || 0}
              </div>
              <div className="text-sm text-slate-600">Generated Insights</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisData && (
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisData.insights.length > 0 ? (
                  analysisData.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-800">{insight}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    No significant insights found. Try analyzing with more data.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            {Object.entries(analysisData.patterns || {}).map(([symptom, patterns]: [string, any]) => (
              <Card key={symptom}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {symptom} Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patterns.length > 0 ? (
                    <div className="space-y-3">
                      {patterns.map((pattern: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium">{pattern.description}</p>
                            <p className="text-sm text-slate-600">
                              {pattern.period}-day cycle
                            </p>
                          </div>
                          <div className="text-right">
                            <Progress value={pattern.confidence} className="w-20 mb-1" />
                            <p className="text-sm text-slate-600">{pattern.confidence}% confidence</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No cyclical patterns detected</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Symptom Correlations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisData.correlations.length > 0 ? (
                  <div className="space-y-3">
                    {analysisData.correlations.map((correlation: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">
                            {correlation.primarySymptom} ↔ {correlation.correlatedSymptom}
                          </p>
                          <p className="text-sm text-slate-600">
                            Observed in {correlation.occurrenceCount} instances
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {correlation.correlationStrength > 0 ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          )}
                          <Badge variant={Math.abs(correlation.correlationStrength) > 60 ? "destructive" : "secondary"}>
                            {Math.abs(correlation.correlationStrength)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No strong correlations found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Triggers Tab */}
          <TabsContent value="triggers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Potential Triggers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisData.triggers.length > 0 ? (
                  <div className="space-y-3">
                    {analysisData.triggers.map((trigger: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{trigger.trigger}</p>
                          <p className="text-sm text-slate-600">{trigger.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {trigger.correlation > 0 ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              {Math.abs(trigger.correlation * 100).toFixed(0)}% impact
                            </div>
                            <div className="text-slate-500">
                              {trigger.occurrences} times
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No significant triggers identified</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Help Text */}
      {!analysisData && symptomLogs && symptomLogs.length >= 7 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
              <p className="text-slate-600 mb-4">
                You have sufficient data to analyze symptom patterns. Click "Analyze Patterns" to discover:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm">Cyclical patterns and rhythms</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm">Improvement or worsening trends</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm">Symptom correlations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm">Environmental triggers</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}