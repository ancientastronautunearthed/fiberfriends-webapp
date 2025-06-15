import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplets, RotateCcw } from "lucide-react";

interface WaterIntakeTrackerProps {
  challengeId: string;
  targetGlasses: number;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export function WaterIntakeTracker({ challengeId, targetGlasses, onProgress, onComplete }: WaterIntakeTrackerProps) {
  const [glassesConsumed, setGlassesConsumed] = useState<boolean[]>(new Array(targetGlasses).fill(false));
  const [animatingGlass, setAnimatingGlass] = useState<number | null>(null);

  const totalConsumed = glassesConsumed.filter(Boolean).length;
  const progress = (totalConsumed / targetGlasses) * 100;

  useEffect(() => {
    onProgress(progress);
    if (totalConsumed === targetGlasses) {
      onComplete();
    }
  }, [totalConsumed, targetGlasses, progress, onProgress, onComplete]);

  const handleGlassClick = (index: number) => {
    if (glassesConsumed[index]) return; // Already filled
    
    setAnimatingGlass(index);
    setTimeout(() => {
      setGlassesConsumed(prev => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });
      setAnimatingGlass(null);
    }, 300);
  };

  const resetTracker = () => {
    setGlassesConsumed(new Array(targetGlasses).fill(false));
    setAnimatingGlass(null);
  };

  const getGlassStyle = (index: number, isFilled: boolean) => {
    const baseStyle = "w-16 h-20 border-2 border-blue-300 rounded-b-lg relative cursor-pointer transition-all duration-300 hover:scale-105";
    
    if (animatingGlass === index) {
      return `${baseStyle} animate-pulse scale-110`;
    }
    
    if (isFilled) {
      return `${baseStyle} bg-gradient-to-t from-blue-400 to-blue-200 border-blue-500 shadow-lg`;
    }
    
    return `${baseStyle} bg-gray-100 hover:bg-blue-50`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Water Intake Tracker
        </CardTitle>
        <CardDescription>
          Click on each glass as you drink them. Target: {targetGlasses} glasses per day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Display */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-blue-600">
            {totalConsumed} / {targetGlasses}
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {totalConsumed === targetGlasses ? "Goal completed! 🎉" : 
             `${targetGlasses - totalConsumed} glasses remaining`}
          </p>
        </div>

        {/* Water Glasses Grid */}
        <div className="grid grid-cols-4 gap-4 justify-items-center p-4">
          {glassesConsumed.map((isFilled, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2"
            >
              <div
                className={getGlassStyle(index, isFilled)}
                onClick={() => handleGlassClick(index)}
              >
                {/* Glass interior water animation */}
                {isFilled && (
                  <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-b-lg animate-[fillWater_0.5s_ease-out]" />
                )}
                
                {/* Glass number label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                  {index + 1}
                </div>
                
                {/* Water droplet icon for empty glasses */}
                {!isFilled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-300" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <Button onClick={resetTracker} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Day
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Hydration Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start your day with a glass of water</li>
            <li>• Keep a water bottle nearby</li>
            <li>• Set reminders to drink water regularly</li>
            <li>• Add lemon or cucumber for flavor</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Add CSS animation for water filling
const style = document.createElement('style');
style.textContent = `
  @keyframes fillWater {
    0% {
      height: 0%;
      opacity: 0.7;
    }
    100% {
      height: 100%;
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);