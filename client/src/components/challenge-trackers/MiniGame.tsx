import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Star, Heart, CheckCircle, X } from "lucide-react";

interface MiniGameProps {
  challengeId: string;
  gameType: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  onComplete: (score: number, bonus: boolean) => void;
  onClose: () => void;
}

export function MiniGame({ 
  challengeId, 
  gameType, 
  title, 
  description, 
  targetValue, 
  currentValue,
  onComplete, 
  onClose 
}: MiniGameProps) {
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'failed'>('playing');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSequence, setShowSequence] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [targetCycles, setTargetCycles] = useState(5);

  useEffect(() => {
    if (gameType === 'memory-sequence') {
      initializeMemoryGame();
    } else if (gameType === 'breathing-exercise') {
      initializeBreathingGame();
    }
  }, [gameType]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('failed');
    }
  }, [timeLeft, gameState]);

  const initializeMemoryGame = () => {
    const newSequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
    setSequence(newSequence);
    setShowSequence(true);
    setTimeout(() => setShowSequence(false), 2000);
  };

  const initializeBreathingGame = () => {
    setTargetCycles(Math.max(3, Math.floor(targetValue / 2)));
    startBreathingCycle();
  };

  const startBreathingCycle = () => {
    let phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    setBreathingPhase(phase);
    
    const cycleTimer = setInterval(() => {
      switch (phase) {
        case 'inhale':
          phase = 'hold';
          setBreathingPhase('hold');
          break;
        case 'hold':
          phase = 'exhale';
          setBreathingPhase('exhale');
          break;
        case 'exhale':
          phase = 'inhale';
          setBreathingPhase('inhale');
          setBreathingCycle(prev => {
            const newCycle = prev + 1;
            if (newCycle >= targetCycles) {
              clearInterval(cycleTimer);
              setGameState('completed');
              setScore(100);
            }
            return newCycle;
          });
          break;
      }
    }, 3000);
  };

  const handleMemoryClick = (colorIndex: number) => {
    if (showSequence) return;
    
    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);
    
    if (newUserSequence[currentStep] !== sequence[currentStep]) {
      setGameState('failed');
      return;
    }
    
    if (newUserSequence.length === sequence.length) {
      setGameState('completed');
      setScore(100);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In Slowly...';
      case 'hold': return 'Hold Your Breath...';
      case 'exhale': return 'Breathe Out Slowly...';
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale': return 'bg-blue-500';
      case 'hold': return 'bg-purple-500';
      case 'exhale': return 'bg-green-500';
    }
  };

  const handleComplete = () => {
    const bonusScore = timeLeft > 15;
    onComplete(score + (bonusScore ? 25 : 0), bonusScore);
  };

  const renderMemoryGame = () => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            {showSequence ? 'Memorize this sequence!' : 'Repeat the sequence by clicking the colors'}
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {colors.map((color, index) => (
              <button
                key={index}
                className={`w-20 h-20 rounded-lg ${color} ${
                  showSequence && sequence[userSequence.length] === index 
                    ? 'ring-4 ring-white animate-pulse' 
                    : ''
                } ${!showSequence ? 'hover:opacity-80' : 'cursor-not-allowed'}`}
                onClick={() => handleMemoryClick(index)}
                disabled={showSequence}
              />
            ))}
          </div>
          <div className="mt-4">
            <Progress value={(userSequence.length / sequence.length) * 100} />
            <p className="text-xs text-gray-500 mt-1">
              Step {userSequence.length + 1} of {sequence.length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderBreathingGame = () => {
    return (
      <div className="space-y-6 text-center">
        <div className="relative">
          <div 
            className={`w-32 h-32 mx-auto rounded-full ${getBreathingColor()} transition-all duration-3000 ${
              breathingPhase === 'inhale' ? 'scale-110' : breathingPhase === 'exhale' ? 'scale-90' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{getBreathingInstruction()}</h3>
          <p className="text-sm text-gray-600">
            Cycle {breathingCycle + 1} of {targetCycles}
          </p>
          <Progress value={(breathingCycle / targetCycles) * 100} />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            Follow the breathing pattern to reduce stress and inflammation. 
            Deep breathing activates your vagus nerve and promotes healing.
          </p>
        </div>
      </div>
    );
  };

  const renderReactionGame = () => {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-8 rounded-lg">
          <Target className="h-12 w-12 mx-auto text-white mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Reaction Challenge</h3>
          <p className="text-white text-sm">
            Click the target as quickly as possible when it appears!
          </p>
        </div>
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={() => {
            setScore(Math.floor(Math.random() * 50) + 50);
            setGameState('completed');
          }}
        >
          <Zap className="h-4 w-4 mr-2" />
          Start Reaction Test
        </Button>
      </div>
    );
  };

  if (gameState === 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Trophy className="h-5 w-5" />
            Challenge Completed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{score}</div>
            <p className="text-sm text-gray-600">Points Earned</p>
            {timeLeft > 15 && (
              <Badge className="mt-2 bg-yellow-500">
                <Star className="h-3 w-3 mr-1" />
                Speed Bonus!
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleComplete} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Claim Rewards
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'failed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <X className="h-5 w-5" />
            Try Again
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Don't worry! Every attempt builds resilience. Try again when you're ready.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => {
              setGameState('playing');
              setScore(0);
              setTimeLeft(30);
              setUserSequence([]);
              setCurrentStep(0);
              if (gameType === 'memory-sequence') initializeMemoryGame();
            }} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {title}
          </CardTitle>
          <Badge variant="outline">
            {timeLeft}s
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        {gameType === 'memory-sequence' && renderMemoryGame()}
        {gameType === 'breathing-exercise' && renderBreathingGame()}
        {gameType === 'reaction-time' && renderReactionGame()}
        
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Score: {score}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}