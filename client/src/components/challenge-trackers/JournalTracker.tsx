import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Target, Save } from "lucide-react";

interface JournalTrackerProps {
  challengeId: string;
  targetWords: number;
  targetDays: number;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

interface JournalEntry {
  date: string;
  content: string;
  wordCount: number;
}

export function JournalTracker({ challengeId, targetWords, targetDays, onProgress, onComplete }: JournalTrackerProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [savedToday, setSavedToday] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const currentWordCount = currentEntry.trim().split(/\s+/).filter(word => word.length > 0).length;
  const todayEntry = entries.find(entry => entry.date === today);
  const completedDays = entries.length;
  const progress = Math.min((completedDays / targetDays) * 100, 100);

  useEffect(() => {
    // Load saved entries from localStorage
    const savedEntries = localStorage.getItem(`journal-${challengeId}`);
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
    
    // Check if already saved today
    if (todayEntry) {
      setCurrentEntry(todayEntry.content);
      setSavedToday(true);
    }
  }, [challengeId, todayEntry]);

  useEffect(() => {
    onProgress(progress);
    if (completedDays >= targetDays) {
      onComplete();
    }
  }, [completedDays, targetDays, progress, onProgress, onComplete]);

  const handleSaveEntry = () => {
    if (currentWordCount < targetWords) {
      return;
    }

    const newEntry: JournalEntry = {
      date: today,
      content: currentEntry,
      wordCount: currentWordCount
    };

    const updatedEntries = entries.filter(entry => entry.date !== today);
    updatedEntries.push(newEntry);
    
    setEntries(updatedEntries);
    localStorage.setItem(`journal-${challengeId}`, JSON.stringify(updatedEntries));
    setSavedToday(true);
  };

  const handleEditToday = () => {
    setSavedToday(false);
  };

  const getProgressColor = () => {
    if (currentWordCount >= targetWords) return "text-green-600";
    if (currentWordCount >= targetWords * 0.5) return "text-yellow-600";
    return "text-gray-600";
  };

  const getCalendarDays = () => {
    const days = [];
    for (let i = 0; i < targetDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (targetDays - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);
      const isToday = dateStr === today;
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        hasEntry: !!entry,
        isToday,
        wordCount: entry?.wordCount || 0
      });
    }
    return days;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Daily Journal Challenge
        </CardTitle>
        <CardDescription>
          Write at least {targetWords} words daily for {targetDays} consecutive days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{completedDays}</div>
            <div className="text-sm text-purple-700">Days Completed</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{targetDays - completedDays}</div>
            <div className="text-sm text-blue-700">Days Remaining</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
            <div className="text-sm text-green-700">Progress</div>
          </div>
        </div>

        <Progress value={progress} className="w-full" />

        {/* Calendar View */}
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Challenge Calendar
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((day) => (
              <div
                key={day.date}
                className={`p-2 rounded-lg text-center text-sm ${
                  day.hasEntry 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : day.isToday 
                      ? 'bg-blue-100 text-blue-800 border-blue-200 border-2'
                      : 'bg-gray-100 text-gray-600'
                } border`}
              >
                <div className="font-semibold">{day.day}</div>
                {day.hasEntry && (
                  <div className="text-xs">{day.wordCount}w</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Entry */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" />
              Today's Entry ({new Date().toLocaleDateString()})
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={currentWordCount >= targetWords ? "default" : "secondary"}>
                <span className={getProgressColor()}>
                  {currentWordCount} / {targetWords} words
                </span>
              </Badge>
              {savedToday && (
                <Badge variant="outline" className="text-green-600">
                  Saved
                </Badge>
              )}
            </div>
          </div>

          <Textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Write about your day, thoughts, goals, or anything that comes to mind..."
            className="min-h-[200px] resize-none"
            disabled={savedToday}
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {currentWordCount < targetWords 
                ? `${targetWords - currentWordCount} more words needed`
                : "Word target reached!"}
            </div>
            
            <div className="flex gap-2">
              {savedToday ? (
                <Button onClick={handleEditToday} variant="outline">
                  Edit Today's Entry
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveEntry}
                  disabled={currentWordCount < targetWords}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Entry
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Writing Tips */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">Writing Prompts & Tips:</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• How are you feeling today? What emotions came up?</li>
            <li>• What went well today? What could have been better?</li>
            <li>• What are your health goals for tomorrow?</li>
            <li>• Describe any symptoms or patterns you noticed</li>
            <li>• What are you grateful for today?</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}