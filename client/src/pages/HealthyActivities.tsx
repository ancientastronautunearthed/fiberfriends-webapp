import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  MapPin, 
  Clock, 
  Briefcase,
  Heart,
  Sparkles,
  RefreshCw,
  Activity,
  Calendar,
  Timer,
  Target
} from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  location: string;
  timestamp: string;
}

interface HealthyActivity {
  id: string;
  name: string;
  description: string;
  duration: string;
  category: 'indoor' | 'outdoor' | 'both';
  weatherConditions: string[];
  healthBenefits: string[];
  morgellonsSpecific: boolean;
  equipmentNeeded?: string[];
}

interface ActivityRecommendations {
  weather: WeatherData | null;
  isWorkDay: boolean;
  dayOffMessage?: string;
  activities: HealthyActivity[];
  weatherMessage: string;
}

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes('sun') || lower.includes('clear')) return <Sun className="h-5 w-5 text-yellow-500" />;
  if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain className="h-5 w-5 text-blue-500" />;
  if (lower.includes('snow')) return <Snowflake className="h-5 w-5 text-blue-300" />;
  return <Cloud className="h-5 w-5 text-gray-500" />;
};

const getCategoryIcon = (category: string) => {
  if (category === 'outdoor') return <Sun className="h-4 w-4 text-green-600" />;
  if (category === 'indoor') return <Clock className="h-4 w-4 text-blue-600" />;
  return <Activity className="h-4 w-4 text-purple-600" />;
};

const getCategoryColor = (category: string) => {
  if (category === 'outdoor') return 'bg-green-100 text-green-800';
  if (category === 'indoor') return 'bg-blue-100 text-blue-800';
  return 'bg-purple-100 text-purple-800';
};

export default function HealthyActivities() {
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: recommendations, 
    isLoading, 
    refetch: refetchRecommendations 
  } = useQuery<ActivityRecommendations>({
    queryKey: ['/api/activities/recommendations'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const handleRefreshRecommendations = async () => {
    setRefreshing(true);
    await refetchRecommendations();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Healthy Activity Recommendations
          </h1>
          <p className="text-gray-600">Personalized activities based on your schedule and current weather</p>
        </div>

        {/* Current Status Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{currentDate}</p>
                  <p className="text-sm text-gray-600">{currentTime}</p>
                </div>
              </div>

              {/* Work Status */}
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {recommendations?.isWorkDay ? 'Work Day' : 'Day Off'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {recommendations?.isWorkDay ? 'Shorter activities recommended' : 'Perfect for longer activities'}
                  </p>
                </div>
              </div>

              {/* Weather */}
              {recommendations?.weather && (
                <div className="flex items-center gap-3">
                  {getWeatherIcon(recommendations.weather.condition)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {recommendations.weather.temperature}°F
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {recommendations.weather.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Day Off Message */}
            {recommendations?.dayOffMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  {recommendations.dayOffMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Get Recommendations Button */}
        <div className="text-center">
          <Button 
            onClick={handleRefreshRecommendations}
            disabled={refreshing}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all hover:scale-105"
          >
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-6 w-6" />
                Refresh Recommendations
              </>
            )}
          </Button>
        </div>

        {/* Activities Grid */}
        {recommendations?.activities && recommendations.activities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-6 w-6 text-green-600" />
              Recommended Activities
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({recommendations.weatherMessage})
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.activities.map((activity) => (
                <Card key={activity.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-gray-900">{activity.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(activity.category)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                          {activity.category}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{activity.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{activity.duration}</span>
                      </div>
                      {activity.morgellonsSpecific && (
                        <span className="text-purple-600 font-medium">Morgellons-Specific</span>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Health Benefits:</h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.healthBenefits.map((benefit, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>

                      {activity.equipmentNeeded && activity.equipmentNeeded.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Equipment Needed:</h4>
                          <div className="flex flex-wrap gap-1">
                            {activity.equipmentNeeded.map((equipment, index) => (
                              <span key={index} className="px-2 py-1 border border-gray-300 text-gray-700 rounded text-xs">
                                {equipment}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Activities Message */}
        {recommendations?.activities && recommendations.activities.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Activities Available
              </h3>
              <p className="text-gray-600 mb-4">
                We're having trouble getting activity recommendations right now.
              </p>
              <Button onClick={handleRefreshRecommendations} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <Card className="bg-blue-50/70 backdrop-blur-sm border border-blue-200">
          <CardContent className="text-center py-4">
            <p className="text-blue-800 text-sm">
              💡 Activities are personalized based on your work schedule, location weather, and Morgellons-specific health needs.
              Recommendations update automatically throughout the day.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}