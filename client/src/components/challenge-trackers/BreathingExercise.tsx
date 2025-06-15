import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw } from "lucide-react";

interface BreathingExerciseProps {
  challengeId: string;
  targetMinutes: number;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export function BreathingExercise({ challengeId, targetMinutes, onProgress, onComplete }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  
  const targetSeconds = targetMinutes * 60;
  const breathingPattern = {
    inhale: 4,
    hold: 4,
    exhale: 6
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setPhaseProgress(prev => {
          const newProgress = prev + 0.1;
          const currentPhaseDuration = breathingPattern[currentPhase];
          
          if (newProgress >= currentPhaseDuration) {
            // Move to next phase
            if (currentPhase === 'inhale') {
              setCurrentPhase('hold');
            } else if (currentPhase === 'hold') {
              setCurrentPhase('exhale');
            } else {
              setCurrentPhase('inhale');
              setCycleCount(count => count + 1);
            }
            return 0;
          }
          return newProgress;
        });
        
        setTotalTime(prev => {
          const newTime = prev + 0.1;
          const progress = Math.min((newTime / targetSeconds) * 100, 100);
          onProgress(progress);
          
          if (newTime >= targetSeconds) {
            setIsActive(false);
            onComplete();
          }
          
          return newTime;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isActive, currentPhase, targetSeconds, onProgress, onComplete]);

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setPhaseProgress(0);
    setTotalTime(0);
    setCycleCount(0);
    onProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingInstruction = () => {
    const timeLeft = breathingPattern[currentPhase] - phaseProgress;
    switch (currentPhase) {
      case 'inhale':
        return `Breathe in... ${Math.ceil(timeLeft)}`;
      case 'hold':
        return `Hold... ${Math.ceil(timeLeft)}`;
      case 'exhale':
        return `Breathe out... ${Math.ceil(timeLeft)}`;
    }
  };

  const getCircleScale = () => {
    if (currentPhase === 'inhale') {
      return 1 + (phaseProgress / breathingPattern.inhale) * 0.5;
    } else if (currentPhase === 'exhale') {
      return 1.5 - (phaseProgress / breathingPattern.exhale) * 0.5;
    }
    return 1.5; // hold phase
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Breathing Exercise</CardTitle>
        <CardDescription>
          Follow the guided breathing pattern for {targetMinutes} minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Breathing Guide */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div
              className={`absolute rounded-full transition-all duration-100 ${
                currentPhase === 'inhale' ? 'bg-blue-400' :
                currentPhase === 'hold' ? 'bg-green-400' :
                'bg-purple-400'
              }`}
              style={{
                width: `${80 * getCircleScale()}px`,
                height: `${80 * getCircleScale()}px`,
                opacity: 0.7
              }}
            />
            <div className="text-center z-10">
              <p className="text-lg font-semibold text-white">
                {getBreathingInstruction()}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Cycle {cycleCount + 1} • {formatTime(totalTime)} / {formatTime(targetSeconds)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={(totalTime / targetSeconds) * 100} />

        {/* Controls */}
        <div className="flex justify-center space-x-2">
          <Button onClick={toggleExercise} variant="default">
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetExercise} variant="outline">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Inhale for 4 seconds (blue circle grows)</p>
          <p>• Hold for 4 seconds (green circle steady)</p>
          <p>• Exhale for 6 seconds (purple circle shrinks)</p>
        </div>
      </CardContent>
    </Card>
  );
}