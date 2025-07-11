import { useEffect, useState } from "react";
import { getResearchContributionStatus, getCommunityHealthInsights } from "@/lib/firestore";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Brain,
  Moon,
  Utensils,
  Droplets,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CommunityInsight {
  id: string;
  insightType: 'trend' | 'correlation' | 'pattern' | 'alert';
  title: string;
  description: string;
  dataPoints: any;
  affectedPopulation: any;
  confidenceLevel: number;
  sampleSize: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  generatedAt: string;
}

interface ResearchContributionStatus {
  hasContributed: boolean;
  contributionCount: number;
  totalDataPoints: number;
  qualityScore: number;
  communityImpactScore: number;
  hasInsightsAccess: boolean;
  researchOptIn: boolean;
}

const getInsightIcon = (category: string) => {
  switch (category) {
    case 'symptoms': return <Activity className="h-5 w-5" />;
    case 'sleep': return <Moon className="h-5 w-5" />;
    case 'diet': return <Utensils className="h-5 w-5" />;
    case 'exercise': return <TrendingUp className="h-5 w-5" />;
    case 'environment': return <Droplets className="h-5 w-5" />;
    default: return <Brain className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-600 border-red-200 bg-red-50';
    case 'high': return 'text-orange-600 border-orange-200 bg-orange-50';
    case 'medium': return 'text-blue-600 border-blue-200 bg-blue-50';
    case 'low': return 'text-green-600 border-green-200 bg-green-50';
    default: return 'text-gray-600 border-gray-200 bg-gray-50';
  }
};

const getInsightTypeIcon = (type: string) => {
  switch (type) {
    case 'trend': return <TrendingUp className="h-4 w-4" />;
    case 'correlation': return <Activity className="h-4 w-4" />;
    case 'pattern': return <Brain className="h-4 w-4" />;
    case 'alert': return <AlertTriangle className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

// Type guard to validate insight type
function isValidInsightType(type: string): type is CommunityInsight['insightType'] {
  return ['trend', 'correlation', 'pattern', 'alert'].includes(type);
}

// Type guard to validate priority
function isValidPriority(priority: string): priority is CommunityInsight['priority'] {
  return ['low', 'medium', 'high', 'critical'].includes(priority);
}

export default function CommunityInsights() {
  const { user } = useFirebaseAuth();
  const [contributionStatus, setContributionStatus] = useState<ResearchContributionStatus | null>(null);
  const [insights, setInsights] = useState<CommunityInsight[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setStatusLoading(false);
        return;
      }

      try {
        // Get contribution status
        const status = await getResearchContributionStatus(user.id);
        setContributionStatus(status);

        // Load insights if user has access
        if (status.hasInsightsAccess) {
          setInsightsLoading(true);
          const communityInsights = await getCommunityHealthInsights();
          
          // Validate and transform the insights data
          const validatedInsights: CommunityInsight[] = communityInsights.map((insight: any) => ({
            ...insight,
            insightType: isValidInsightType(insight.insightType) ? insight.insightType : 'pattern',
            priority: isValidPriority(insight.priority) ? insight.priority : 'medium'
          }));
          
          setInsights(validatedInsights);
        }
      } catch (err) {
        console.error('Error loading community insights:', err);
        setError('Failed to load insights');
      } finally {
        setStatusLoading(false);
        setInsightsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (statusLoading || insightsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contributionStatus?.hasInsightsAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Community Health Insights
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join our research initiative to access aggregated community health insights 
                and contribute to advancing Morgellons understanding.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Why Contribute to Research?
              </h2>
              <p className="text-gray-700 mb-4">
                By anonymously sharing your health data, you help researchers identify patterns 
                and trends that could lead to better treatments and understanding of Morgellons.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Completely Anonymous</p>
                    <p className="text-sm text-gray-600">Your personal information is never shared</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Advance Research</p>
                    <p className="text-sm text-gray-600">Help identify patterns and improve treatments</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Community Benefits</p>
                    <p className="text-sm text-gray-600">Gain access to aggregated health trends</p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How to Contribute</AlertTitle>
                <AlertDescription>
                  Complete your daily symptom logs to automatically contribute anonymized data. 
                  Your contribution helps generate insights for the entire community.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to Load Insights</AlertTitle>
            <AlertDescription>
              There was an error loading community insights. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const insightsByCategory = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) acc[insight.category] = [];
    acc[insight.category].push(insight);
    return acc;
  }, {} as Record<string, CommunityInsight[]>);

  const categories = Object.keys(insightsByCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Community Health Insights
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Explore aggregated health trends and patterns from the Morgellons community. 
            These insights are generated from anonymized data contributed by community members.
          </p>
        </div>

        {/* Contribution Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {contributionStatus?.contributionCount || 0}
              </div>
              <p className="text-xs text-gray-500">Data submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contributionStatus?.totalDataPoints || 0}
              </div>
              <p className="text-xs text-gray-500">Shared with research</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {contributionStatus?.qualityScore || 0}%
              </div>
              <Progress 
                value={contributionStatus?.qualityScore || 0} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Community Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {contributionStatus?.communityImpactScore || 0}
              </div>
              <p className="text-xs text-gray-500">Impact score</p>
            </CardContent>
          </Card>
        </div>

        {/* Insights Tabs */}
        <Tabs defaultValue={categories[0]} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {getInsightIcon(category)}
                <span className="ml-2">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-6">
              {insightsByCategory[category].map(insight => (
                <Card key={insight.id} className={`border-l-4 ${getPriorityColor(insight.priority)}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {getInsightTypeIcon(insight.insightType)}
                        <span>{insight.title}</span>
                      </CardTitle>
                      <Badge 
                        variant={insight.priority === 'critical' || insight.priority === 'high' ? 
                          'destructive' : 'secondary'}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{insight.sampleSize} contributors</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Activity className="h-4 w-4" />
                        <span>{insight.confidenceLevel}% confidence</span>
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    
                    {/* Data visualization for specific insights */}
                    {insight.dataPoints && (
                      <div className="space-y-3">
                        {insight.dataPoints.average_reduction && (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium">Symptom Reduction</span>
                            <span className="text-xl font-bold text-green-600">
                              {insight.dataPoints.average_reduction}%
                            </span>
                          </div>
                        )}
                        
                        {insight.dataPoints.improvement_percentage && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium">Improvement</span>
                            <span className="text-xl font-bold text-blue-600">
                              {insight.dataPoints.improvement_percentage}%
                            </span>
                          </div>
                        )}
                        
                        {insight.dataPoints.symptom_increase && (
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <span className="text-sm font-medium">Symptom Increase</span>
                            <span className="text-xl font-bold text-orange-600">
                              {insight.dataPoints.symptom_increase}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs text-gray-500">
                      Generated: {new Date(insight.generatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}