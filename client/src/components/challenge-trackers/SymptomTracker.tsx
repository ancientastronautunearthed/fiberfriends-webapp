import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Activity, Clock, Save } from "lucide-react";

interface SymptomTrackerProps {
  challengeId: string;
  targetDays: number;
  timeOfDay: string;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

interface SymptomEntry {
  date: string;
  timeOfDay: string;
  skinSymptoms: string;
  fiberSymptoms: string;
  painLevel: number;
  fatigueLevel: number;
  moodLevel: number;
  notes: string;
  completed: boolean;
}

export function SymptomTracker({ challengeId, targetDays, timeOfDay, onProgress, onComplete }: SymptomTrackerProps) {
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<SymptomEntry>({
    date: new Date().toISOString().split('T')[0],
    timeOfDay,
    skinSymptoms: "",
    fiberSymptoms: "",
    painLevel: 0,
    fatigueLevel: 0,
    moodLevel: 5,
    notes: "",
    completed: false
  });
  const [savedToday, setSavedToday] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const completedDays = entries.filter(entry => entry.completed).length;
  const progress = Math.min((completedDays / targetDays) * 100, 100);

  useEffect(() => {
    // Load saved entries
    const savedEntries = localStorage.getItem(`symptoms-${challengeId}`);
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries);
      setEntries(parsedEntries);
      
      const todayEntry = parsedEntries.find((entry: SymptomEntry) => entry.date === today);
      if (todayEntry) {
        setCurrentEntry(todayEntry);
        setSavedToday(todayEntry.completed);
      }
    }
  }, [challengeId, today]);

  useEffect(() => {
    onProgress(progress);
    if (completedDays >= targetDays) {
      onComplete();
    }
  }, [completedDays, targetDays, progress]);

  const handleSaveEntry = () => {
    const entryToSave = { ...currentEntry, completed: true };
    const updatedEntries = entries.filter(entry => entry.date !== today);
    updatedEntries.push(entryToSave);
    
    setEntries(updatedEntries);
    localStorage.setItem(`symptoms-${challengeId}`, JSON.stringify(updatedEntries));
    setSavedToday(true);
  };

  const handleEditToday = () => {
    setSavedToday(false);
  };

  const updateCurrentEntry = (field: keyof SymptomEntry, value: any) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
  };

  const isFormComplete = () => {
    return currentEntry.skinSymptoms.trim() !== "" && 
           currentEntry.fiberSymptoms.trim() !== "" &&
           currentEntry.notes.trim() !== "";
  };

  const getScaleColor = (value: number, scale: 'pain' | 'fatigue' | 'mood') => {
    if (scale === 'mood') {
      if (value >= 7) return "text-green-600";
      if (value >= 4) return "text-yellow-600";
      return "text-red-600";
    } else {
      if (value <= 3) return "text-green-600";
      if (value <= 6) return "text-yellow-600";
      return "text-red-600";
    }
  };

  const getStreakDays = () => {
    const sortedEntries = entries
      .filter(entry => entry.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" />
          Morning Symptom Check
        </CardTitle>
        <CardDescription>
          Track your symptoms each {timeOfDay} for {targetDays} consecutive days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{completedDays}</div>
            <div className="text-sm text-blue-700">Days Completed</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{getStreakDays()}</div>
            <div className="text-sm text-orange-700">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
            <div className="text-sm text-green-700">Progress</div>
          </div>
        </div>

        <Progress value={progress} className="w-full" />

        {/* Today's Check-in */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Today's {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Check-in
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
              {savedToday && (
                <Badge variant="default" className="bg-green-600">
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Symptom Assessment Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skin Symptoms */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Skin Symptoms</label>
              <Select
                value={currentEntry.skinSymptoms}
                onValueChange={(value) => updateCurrentEntry('skinSymptoms', value)}
                disabled={savedToday}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skin condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No symptoms</SelectItem>
                  <SelectItem value="mild-itching">Mild itching</SelectItem>
                  <SelectItem value="moderate-itching">Moderate itching</SelectItem>
                  <SelectItem value="severe-itching">Severe itching</SelectItem>
                  <SelectItem value="crawling-sensation">Crawling sensation</SelectItem>
                  <SelectItem value="burning">Burning sensation</SelectItem>
                  <SelectItem value="lesions">Lesions present</SelectItem>
                  <SelectItem value="rash">Rash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fiber Symptoms */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fiber-related Symptoms</label>
              <Select
                value={currentEntry.fiberSymptoms}
                onValueChange={(value) => updateCurrentEntry('fiberSymptoms', value)}
                disabled={savedToday}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fiber symptoms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No fibers observed</SelectItem>
                  <SelectItem value="few-fibers">Few fibers emerging</SelectItem>
                  <SelectItem value="moderate-fibers">Moderate fiber activity</SelectItem>
                  <SelectItem value="many-fibers">Many fibers present</SelectItem>
                  <SelectItem value="colored-fibers">Colored fibers</SelectItem>
                  <SelectItem value="black-specks">Black specks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Severity Scales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pain Level (0-10)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={currentEntry.painLevel}
                  onChange={(e) => updateCurrentEntry('painLevel', parseInt(e.target.value))}
                  disabled={savedToday}
                  className="flex-1"
                />
                <span className={`font-bold ${getScaleColor(currentEntry.painLevel, 'pain')}`}>
                  {currentEntry.painLevel}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fatigue Level (0-10)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={currentEntry.fatigueLevel}
                  onChange={(e) => updateCurrentEntry('fatigueLevel', parseInt(e.target.value))}
                  disabled={savedToday}
                  className="flex-1"
                />
                <span className={`font-bold ${getScaleColor(currentEntry.fatigueLevel, 'fatigue')}`}>
                  {currentEntry.fatigueLevel}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mood Level (1-10)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEntry.moodLevel}
                  onChange={(e) => updateCurrentEntry('moodLevel', parseInt(e.target.value))}
                  disabled={savedToday}
                  className="flex-1"
                />
                <span className={`font-bold ${getScaleColor(currentEntry.moodLevel, 'mood')}`}>
                  {currentEntry.moodLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes</label>
            <Textarea
              value={currentEntry.notes}
              onChange={(e) => updateCurrentEntry('notes', e.target.value)}
              placeholder="Describe any additional symptoms, triggers, or observations..."
              disabled={savedToday}
              className="min-h-[100px]"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {!isFormComplete() && !savedToday
                ? "Please complete all required fields"
                : savedToday
                ? "Today's check-in completed"
                : "Ready to save"}
            </div>
            
            <div className="flex gap-2">
              {savedToday ? (
                <Button onClick={handleEditToday} variant="outline">
                  Edit Today's Entry
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveEntry}
                  disabled={!isFormComplete()}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Complete Check-in
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">Tracking Tips:</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Be consistent with timing - check symptoms at the same time daily</li>
            <li>• Be honest about severity levels for accurate pattern tracking</li>
            <li>• Note any potential triggers (foods, stress, environment)</li>
            <li>• Take photos if needed for documentation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}