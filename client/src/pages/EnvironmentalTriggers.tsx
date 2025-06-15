import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, Eye, Activity, MapPin, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { format, startOfDay, subDays, isWithinInterval } from "date-fns";

interface WeatherData {
  temperature: number;
  humidity: number;
  barometricPressure?: number;
  weatherCondition: string;
  windSpeed: number;
  uvIndex?: number;
  airQuality?: number;
  location: string;
  feelsLike?: number;
}

interface EnvironmentalEntry {
  id: string;
  userId: string;
  temperature: number;
  humidity: number;
  barometricPressure?: number;
  weatherCondition: string;
  windSpeed: number;
  uvIndex?: number;
  airQuality?: number;
  locationName: string;
  latitude?: number;
  longitude?: number;
  stressLevel: number;
  sleepQuality: number;
  sleepHours: number;
  indoorOutdoorTime: { indoor: number; outdoor: number };
  exposureFactors: string[];
  symptomSeverity: number;
  primarySymptoms: string[];
  moodRating: number;
  energyLevel: number;
  recordedAt: Date;
  dataSource: string;
  notes?: string;
}

interface EnvironmentalCorrelation {
  id: string;
  triggerType: string;
  triggerValue: string;
  correlationStrength: number;
  confidenceLevel: number;
  patternDescription: string;
  recommendations: string[];
  timeframe: string;
  occurrenceCount: number;
  averageSymptomIncrease: number;
}

const EXPOSURE_FACTORS = [
  "Cleaning chemicals", "Perfumes/fragrances", "Smoke", "Pollen", "Dust",
  "Pet dander", "Mold", "New clothing", "Synthetic fabrics", "Air fresheners",
  "Paint fumes", "Pesticides", "Industrial pollution", "Construction dust"
];

const SYMPTOM_OPTIONS = [
  "Skin crawling", "Itching", "Lesions", "Fatigue", "Brain fog",
  "Joint pain", "Muscle aches", "Headaches", "Sleep disturbances",
  "Anxiety", "Depression", "Digestive issues", "Respiratory issues"
];

const WEATHER_ICONS = {
  sunny: Sun,
  clear: Sun,
  cloudy: Cloud,
  clouds: Cloud,
  rain: CloudRain,
  drizzle: CloudRain,
  snow: Cloud,
  mist: Cloud,
  fog: Cloud
};

export default function EnvironmentalTriggers() {
  const { user } = useFirebaseAuth();
  // Firestore helpers
  const addDocument = async (path: string, data: any) => {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  };

  const getUserDocuments = async (path: string) => {
    const q = query(
      collection(db, path),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [environmentalEntries, setEnvironmentalEntries] = useState<EnvironmentalEntry[]>([]);
  const [correlations, setCorrelations] = useState<EnvironmentalCorrelation[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [stressLevel, setStressLevel] = useState([5]);
  const [sleepQuality, setSleepQuality] = useState([7]);
  const [sleepHours, setSleepHours] = useState(8);
  const [indoorHours, setIndoorHours] = useState(16);
  const [outdoorHours, setOutdoorHours] = useState(8);
  const [selectedExposures, setSelectedExposures] = useState<string[]>([]);
  const [symptomSeverity, setSymptomSeverity] = useState([3]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [moodRating, setMoodRating] = useState([7]);
  const [energyLevel, setEnergyLevel] = useState([6]);
  const [notes, setNotes] = useState("");
  const [customLocation, setCustomLocation] = useState("");

  useEffect(() => {
    if (user) {
      loadEnvironmentalData();
      getCurrentWeatherData();
    }
  }, [user]);

  const getCurrentWeatherData = async () => {
    if (!user) return;
    
    setLoadingWeather(true);
    try {
      // Try to get user's location from browser
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoords(latitude, longitude);
          },
          () => {
            // Fallback to user's saved location or default
            fetchWeatherByLocation(customLocation || "New York");
          }
        );
      } else {
        await fetchWeatherByLocation(customLocation || "New York");
      }
    } catch (error) {
      console.error("Error getting weather:", error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/weather/coords?lat=${lat}&lon=${lon}`);
      if (response.ok) {
        const weather = await response.json();
        setCurrentWeather(weather);
      }
    } catch (error) {
      console.error("Error fetching weather by coords:", error);
    }
  };

  const fetchWeatherByLocation = async (location: string) => {
    try {
      const response = await fetch(`/api/weather/location?location=${encodeURIComponent(location)}`);
      if (response.ok) {
        const weather = await response.json();
        setCurrentWeather(weather);
      }
    } catch (error) {
      console.error("Error fetching weather by location:", error);
    }
  };

  const loadEnvironmentalData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const entries = await getUserDocuments(`environmentalTriggers`);
      setEnvironmentalEntries(entries.map((doc: any) => ({
        ...doc,
        recordedAt: doc.recordedAt?.toDate ? doc.recordedAt.toDate() : new Date(doc.recordedAt || Date.now())
      })) as EnvironmentalEntry[]);

      const correlationData = await getUserDocuments(`environmentalCorrelations`);
      setCorrelations(correlationData as EnvironmentalCorrelation[]);
    } catch (error) {
      console.error("Error loading environmental data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEntry = async () => {
    if (!user || !currentWeather) return;

    const entry = {
      userId: user.uid,
      temperature: currentWeather.temperature,
      humidity: currentWeather.humidity,
      barometricPressure: currentWeather.barometricPressure,
      weatherCondition: currentWeather.weatherCondition,
      windSpeed: currentWeather.windSpeed,
      uvIndex: currentWeather.uvIndex,
      airQuality: currentWeather.airQuality,
      locationName: currentWeather.location,
      stressLevel: stressLevel[0],
      sleepQuality: sleepQuality[0],
      sleepHours: sleepHours,
      indoorOutdoorTime: { indoor: indoorHours, outdoor: outdoorHours },
      exposureFactors: selectedExposures,
      symptomSeverity: symptomSeverity[0],
      primarySymptoms: selectedSymptoms,
      moodRating: moodRating[0],
      energyLevel: energyLevel[0],
      recordedAt: new Date(),
      dataSource: "manual",
      notes: notes
    };

    try {
      await addDocument(`environmentalTriggers`, entry);
      
      // Reset form
      setStressLevel([5]);
      setSleepQuality([7]);
      setSleepHours(8);
      setIndoorHours(16);
      setOutdoorHours(8);
      setSelectedExposures([]);
      setSymptomSeverity([3]);
      setSelectedSymptoms([]);
      setMoodRating([7]);
      setEnergyLevel([6]);
      setNotes("");

      // Reload data
      await loadEnvironmentalData();
      
      // Generate correlations if we have enough data
      if (environmentalEntries.length >= 5) {
        await generateCorrelations();
      }
    } catch (error) {
      console.error("Error saving environmental entry:", error);
    }
  };

  const generateCorrelations = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/ai/environmental-correlations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          entries: environmentalEntries.slice(-30) // Last 30 entries
        })
      });

      if (response.ok) {
        const newCorrelations = await response.json();
        
        // Save correlations to Firestore
        for (const correlation of newCorrelations) {
          await addDocument(`environmentalCorrelations`, correlation);
        }
        
        await loadEnvironmentalData();
      }
    } catch (error) {
      console.error("Error generating correlations:", error);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const IconComponent = WEATHER_ICONS[condition.toLowerCase() as keyof typeof WEATHER_ICONS] || Cloud;
    return <IconComponent className="h-6 w-6" />;
  };

  const getCorrelationStrengthColor = (strength: number) => {
    if (strength >= 0.7) return "text-red-600";
    if (strength >= 0.5) return "text-orange-600";
    if (strength >= 0.3) return "text-yellow-600";
    return "text-green-600";
  };

  const getRecentTrends = () => {
    if (environmentalEntries.length < 7) return null;

    const last7Days = environmentalEntries
      .filter(entry => isWithinInterval(entry.recordedAt, {
        start: subDays(new Date(), 7),
        end: new Date()
      }))
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());

    if (last7Days.length < 3) return null;

    const avgSymptomSeverity = last7Days.reduce((sum, entry) => sum + entry.symptomSeverity, 0) / last7Days.length;
    const avgStressLevel = last7Days.reduce((sum, entry) => sum + entry.stressLevel, 0) / last7Days.length;
    const avgMoodRating = last7Days.reduce((sum, entry) => sum + entry.moodRating, 0) / last7Days.length;

    return { avgSymptomSeverity, avgStressLevel, avgMoodRating };
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to track environmental triggers and correlations.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const trends = getRecentTrends();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Environmental Trigger Tracking</h1>
        <p className="text-muted-foreground">
          Track weather conditions, stress levels, and environmental factors to identify patterns with your symptoms.
        </p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current Entry</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Current Weather */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentWeather && getWeatherIcon(currentWeather.weatherCondition)}
                Current Weather Conditions
              </CardTitle>
              <CardDescription>
                Weather data is automatically captured for correlation analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingWeather ? (
                <div className="text-center py-4">Loading weather data...</div>
              ) : currentWeather ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Temperature</div>
                      <div className="font-semibold">{currentWeather.temperature}°F</div>
                      {currentWeather.feelsLike && (
                        <div className="text-xs text-muted-foreground">Feels like {currentWeather.feelsLike}°F</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                      <div className="font-semibold">{currentWeather.humidity}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Wind</div>
                      <div className="font-semibold">{currentWeather.windSpeed} mph</div>
                    </div>
                  </div>
                  {currentWeather.barometricPressure && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Pressure</div>
                        <div className="font-semibold">{currentWeather.barometricPressure.toFixed(2)} inHg</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-semibold">{currentWeather.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Condition</div>
                      <div className="font-semibold capitalize">{currentWeather.weatherCondition}</div>
                    </div>
                  </div>
                  {currentWeather.uvIndex && (
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">UV Index</div>
                        <div className="font-semibold">{currentWeather.uvIndex}</div>
                      </div>
                    </div>
                  )}
                  {currentWeather.airQuality && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Air Quality</div>
                        <div className="font-semibold">{currentWeather.airQuality} AQI</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button onClick={getCurrentWeatherData} variant="outline">
                    Load Weather Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environmental & Personal Factors Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal & Environmental Factors</CardTitle>
              <CardDescription>
                Record your current stress level, sleep quality, and environmental exposures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stress Level */}
              <div className="space-y-2">
                <Label>Stress Level (1-10)</Label>
                <Slider
                  value={stressLevel}
                  onValueChange={setStressLevel}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">Current: {stressLevel[0]}/10</div>
              </div>

              {/* Sleep Quality */}
              <div className="space-y-2">
                <Label>Sleep Quality Last Night (1-10)</Label>
                <Slider
                  value={sleepQuality}
                  onValueChange={setSleepQuality}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">Rating: {sleepQuality[0]}/10</div>
              </div>

              {/* Sleep Hours */}
              <div className="space-y-2">
                <Label htmlFor="sleepHours">Hours of Sleep</Label>
                <Input
                  id="sleepHours"
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  min={0}
                  max={24}
                  step={0.5}
                />
              </div>

              {/* Indoor/Outdoor Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="indoorHours">Indoor Hours (today)</Label>
                  <Input
                    id="indoorHours"
                    type="number"
                    value={indoorHours}
                    onChange={(e) => setIndoorHours(Number(e.target.value))}
                    min={0}
                    max={24}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outdoorHours">Outdoor Hours (today)</Label>
                  <Input
                    id="outdoorHours"
                    type="number"
                    value={outdoorHours}
                    onChange={(e) => setOutdoorHours(Number(e.target.value))}
                    min={0}
                    max={24}
                  />
                </div>
              </div>

              {/* Environmental Exposures */}
              <div className="space-y-3">
                <Label>Environmental Exposures (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPOSURE_FACTORS.map((factor) => (
                    <div key={factor} className="flex items-center space-x-2">
                      <Checkbox
                        id={factor}
                        checked={selectedExposures.includes(factor)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedExposures([...selectedExposures, factor]);
                          } else {
                            setSelectedExposures(selectedExposures.filter(f => f !== factor));
                          }
                        }}
                      />
                      <Label htmlFor={factor} className="text-sm">{factor}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Symptom Tracking */}
              <div className="space-y-2">
                <Label>Overall Symptom Severity (1-10)</Label>
                <Slider
                  value={symptomSeverity}
                  onValueChange={setSymptomSeverity}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">Current: {symptomSeverity[0]}/10</div>
              </div>

              {/* Primary Symptoms */}
              <div className="space-y-3">
                <Label>Primary Symptoms Today (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SYMPTOM_OPTIONS.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSymptoms([...selectedSymptoms, symptom]);
                          } else {
                            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
                          }
                        }}
                      />
                      <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Rating */}
              <div className="space-y-2">
                <Label>Mood Rating (1-10)</Label>
                <Slider
                  value={moodRating}
                  onValueChange={setMoodRating}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">Current: {moodRating[0]}/10</div>
              </div>

              {/* Energy Level */}
              <div className="space-y-2">
                <Label>Energy Level (1-10)</Label>
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">Current: {energyLevel[0]}/10</div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional observations about your environment, activities, or symptoms..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSubmitEntry} 
                disabled={!currentWeather || loading}
                className="w-full"
              >
                Save Environmental Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Environmental Correlations
              </CardTitle>
              <CardDescription>
                AI-identified patterns between environmental factors and your symptoms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {correlations.length > 0 ? (
                <div className="space-y-4">
                  {correlations.map((correlation) => (
                    <div key={correlation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{correlation.triggerType}: {correlation.triggerValue}</h4>
                          <p className="text-sm text-muted-foreground">{correlation.patternDescription}</p>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${getCorrelationStrengthColor(correlation.correlationStrength)}`}>
                            {(correlation.correlationStrength * 100).toFixed(0)}% correlation
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {correlation.confidenceLevel >= 0.8 ? "High" : 
                             correlation.confidenceLevel >= 0.6 ? "Medium" : "Low"} confidence
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="text-sm">
                          <span className="font-medium">Impact: </span>
                          {correlation.averageSymptomIncrease > 0 ? 
                            `+${correlation.averageSymptomIncrease.toFixed(1)}% symptom increase` :
                            `${correlation.averageSymptomIncrease.toFixed(1)}% symptom change`
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Based on {correlation.occurrenceCount} occurrences over {correlation.timeframe}
                        </div>
                      </div>

                      {correlation.recommendations.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-1">Recommendations:</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {correlation.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-blue-500">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Correlations Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Keep logging environmental data to identify patterns. We need at least 5 entries to start generating correlations.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Current entries: {environmentalEntries.length}/5
                  </div>
                  {environmentalEntries.length > 0 && (
                    <Progress value={(environmentalEntries.length / 5) * 100} className="w-64 mx-auto mt-2" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
              <CardDescription>
                Your patterns over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trends ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{trends.avgSymptomSeverity.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Avg Symptom Severity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{trends.avgStressLevel.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Avg Stress Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{trends.avgMoodRating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Avg Mood Rating</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Not enough data for trend analysis. Keep logging environmental factors to see your patterns.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entry History</CardTitle>
              <CardDescription>
                Your recorded environmental and symptom data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {environmentalEntries.length > 0 ? (
                <div className="space-y-4">
                  {environmentalEntries
                    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
                    .slice(0, 10)
                    .map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{format(entry.recordedAt, "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.locationName} • {entry.temperature}°F • {entry.weatherCondition}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="font-medium">Symptoms: </span>
                            <Badge variant={entry.symptomSeverity <= 3 ? "secondary" : 
                                         entry.symptomSeverity <= 6 ? "default" : "destructive"}>
                              {entry.symptomSeverity}/10
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Stress:</span> {entry.stressLevel}/10
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sleep:</span> {entry.sleepQuality}/10
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mood:</span> {entry.moodRating}/10
                        </div>
                        <div>
                          <span className="text-muted-foreground">Energy:</span> {entry.energyLevel}/10
                        </div>
                      </div>

                      {entry.primarySymptoms.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">Symptoms: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.primarySymptoms.map((symptom) => (
                              <Badge key={symptom} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.exposureFactors.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">Exposures: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.exposureFactors.map((factor) => (
                              <Badge key={factor} variant="secondary" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Notes: </span>
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No environmental entries yet. Start logging to track your patterns.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}