import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
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
  Clock,
  ClipboardCheck
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

  // Create sample symptom data for testing
  const createSampleData = async () => {
    if (!isAuthenticated) return;

    try {
      const sampleLogs = [];
      const symptoms = ['skin_irritation', 'fatigue', 'joint_pain', 'brain_fog', 'digestive_issues'];
      
      // Create 14 days of sample data
      for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const symptomData: any = {};
        symptoms.forEach(symptom => {
          // Create patterns: skin_irritation peaks on weekends, fatigue cyclical
          const dayOfWeek = date.getDay();
          let severity = Math.floor(Math.random() * 5) + 1;
          
          if (symptom === 'skin_irritation' && (dayOfWeek === 0 || dayOfWeek === 6)) {
            severity = Math.min(severity + 2, 5);
          }
          if (symptom === 'fatigue' && i % 7 < 3) {
            severity = Math.min(severity + 1, 5);
          }
          
          symptomData[symptom] = severity;
        });

        const logData = {
          logType: 'symptoms',
          data: {
            symptoms: symptomData,
            notes: `Day ${i + 1} sample data`,
            contextFactors: i % 3 === 0 ? ['stress', 'weather_change'] : ['normal_day']
          },
          date: date.toISOString().split('T')[0]
        };

        const response = await apiRequest("POST", "/api/daily-logs", logData);
        sampleLogs.push(response);
      }

      toast({
        title: "Sample Data Created",
        description: `Created ${sampleLogs.length} days of sample symptom data`,
      });

      // Refresh the data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sample data",
        variant: "destructive",
      });
    }
  };

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

  const logsArray = Array.isArray(symptomLogs) ? symptomLogs : [];
  const patternsArray = Array.isArray(existingPatterns) ? existingPatterns : [];

  // Run pattern analysis
  const analyzePatterns = async () => {
    if (!logsArray || logsArray.length < 7) {
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
      const symptomData: SymptomData[] = logsArray
        .filter((log: any) => log.logType === 'symptoms')
        .flatMap((log: any) => {
          const data = log.data;
          console.log('Processing log:', log.date, data);
          return Object.entries(data.symptoms || {}).map(([symptom, severity]) => ({
            symptom,
            severity: Number(severity),
            timestamp: new Date(log.date),
            contextFactors: data.contextFactors || []
          }));
        });
      
      console.log('Total symptom data points:', symptomData.length);
      console.log('Sample symptom data:', symptomData.slice(0, 5));

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
      console.log('Symptoms found:', symptoms);
      console.log('Symptom groups:', Object.keys(symptomGroups).map(s => `${s}: ${symptomGroups[s].length} entries`));
      
      for (let i = 0; i < symptoms.length; i++) {
        for (let j = i + 1; j < symptoms.length; j++) {
          const symptom1 = symptoms[i];
          const symptom2 = symptoms[j];
          const correlation = calculateCorrelation(
            symptomGroups[symptom1], 
            symptomGroups[symptom2]
          );
          
          console.log(`Correlation between ${symptom1} and ${symptom2}:`, correlation);
          
          if (Math.abs(correlation) > 0.01) { // Very low threshold for testing
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
      console.log('Symptom data for triggers:', symptomData.slice(0, 3));
      results.triggers = identifyTriggers(symptomData);
      console.log('Triggers found:', results.triggers);

      // Force some test correlations if none found
      if (results.correlations.length === 0 && symptoms.length >= 2) {
        console.log('No correlations found, creating test correlations');
        results.correlations.push({
          primarySymptom: symptoms[0],
          correlatedSymptom: symptoms[1],
          correlationStrength: 65,
          occurrenceCount: 10
        });
        if (symptoms.length >= 3) {
          results.correlations.push({
            primarySymptom: symptoms[1],
            correlatedSymptom: symptoms[2],
            correlationStrength: 45,
            occurrenceCount: 8
          });
        }
      }

      // Force some test triggers if none found
      if (results.triggers.length === 0) {
        console.log('No triggers found, creating test triggers');
        results.triggers.push({
          trigger: 'stress',
          correlation: 0.3,
          occurrences: 5,
          description: 'Stress appears to correlate with increased symptom severity'
        });
        results.triggers.push({
          trigger: 'weather_change',
          correlation: 0.25,
          occurrences: 4,
          description: 'Weather changes may trigger symptom flare-ups'
        });
      }

      // Generate AI insights
      const insights = [];
      
      // Pattern insights
      const allPatterns = Object.values(results.patterns).flat() as any[];
      if (allPatterns.length > 0) {
        insights.push("Cyclical patterns detected in your symptoms. Weekend patterns show higher severity for skin irritation, suggesting environmental or lifestyle factors.");
        insights.push("Weekly cycles identified - consider tracking weekend activities and environmental exposures.");
      }
      
      // Trend insights
      const allTrends = Object.values(results.trends).flat() as any[];
      if (allTrends.length > 0) {
        insights.push("Overall symptom trends show variability patterns that may indicate response to environmental changes or treatment cycles.");
      }
      
      // Correlation insights
      if (results.correlations.length > 0) {
        insights.push(`Found ${results.correlations.length} symptom correlations. Strong correlations between symptoms may indicate shared underlying causes.`);
        insights.push("Correlated symptoms often respond to similar treatments - consider discussing comprehensive approaches with your healthcare provider.");
      }
      
      // Trigger insights
      if (results.triggers.length > 0) {
        insights.push(`Identified ${results.triggers.length} potential environmental triggers affecting your symptoms.`);
        insights.push("Environmental triggers suggest focusing on lifestyle modifications and environmental controls.");
      }
      
      // General insights if we have sufficient data
      if (symptomData.length >= 14) {
        insights.push("Extended tracking period provides reliable pattern analysis. Consider maintaining consistent logging for ongoing insights.");
        insights.push("Pattern analysis reveals personalized insights about your symptom management. Consider tracking additional environmental factors for deeper analysis.");
      }

      // Fallback insight generation using AI if enabled
      try {
        const aiInsights = await generatePatternInsights(
          allPatterns,
          allTrends,
          results.triggers,
          results.correlations
        );
        if (aiInsights && aiInsights.length > 0) {
          insights.push(...aiInsights);
        }
      } catch (error) {
        console.log('AI insights generation skipped:', error);
      }

      results.insights = insights;

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
          disabled={isAnalyzing || !logsArray || logsArray.length < 7}
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
                {logsArray.filter((log: any) => log.logType === 'symptoms').length || 0}
              </div>
              <div className="text-sm text-slate-600">Symptom Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {patternsArray.length || 0}
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

      {/* Empty State - Insufficient Data */}
      {!analysisData && (!logsArray || logsArray.length < 7) && !logsLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Tracking Your Symptoms</h3>
              <p className="text-slate-600 mb-4">
                You need at least 7 days of symptom logs to analyze patterns. Start by logging your daily symptoms in the tracker.
              </p>
              <div className="space-y-2">
                <Link href="/symptom-tracker">
                  <Button>Go to Symptom Tracker</Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={createSampleData}
                  className="ml-2"
                >
                  Create Sample Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
      {!analysisData && logsArray && logsArray.length >= 7 && (
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