import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Save, RotateCcw } from "lucide-react";

interface SymptomData {
  id: string;
  name: string;
  intensity: number;
  mood: 'good' | 'neutral' | 'poor' | 'severe';
  angle: number;
}

const SYMPTOMS = [
  { id: 'itching', name: 'Itching', angle: 0 },
  { id: 'fatigue', name: 'Fatigue', angle: 45 },
  { id: 'brain_fog', name: 'Brain Fog', angle: 90 },
  { id: 'skin_lesions', name: 'Skin Lesions', angle: 135 },
  { id: 'crawling', name: 'Crawling Sensation', angle: 180 },
  { id: 'joint_pain', name: 'Joint Pain', angle: 225 },
  { id: 'sleep_issues', name: 'Sleep Issues', angle: 270 },
  { id: 'anxiety', name: 'Anxiety', angle: 315 }
];

const MOOD_COLORS = {
  good: '#10b981', // green-500
  neutral: '#f59e0b', // amber-500  
  poor: '#f97316', // orange-500
  severe: '#ef4444' // red-500
};

const getMoodFromIntensity = (intensity: number): 'good' | 'neutral' | 'poor' | 'severe' => {
  if (intensity <= 2) return 'good';
  if (intensity <= 4) return 'neutral';
  if (intensity <= 7) return 'poor';
  return 'severe';
};

interface SymptomTrackingWheelProps {
  onDataChange?: (data: { symptoms: SymptomData[]; overallMood: number }) => void;
}

export function SymptomTrackingWheel({ onDataChange }: SymptomTrackingWheelProps) {
  const [symptoms, setSymptoms] = useState<SymptomData[]>(
    SYMPTOMS.map(s => ({
      ...s,
      intensity: 0,
      mood: 'good' as const
    }))
  );
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateSymptom = (id: string, intensity: number) => {
    const updatedSymptoms = symptoms.map(symptom => 
      symptom.id === id 
        ? { ...symptom, intensity, mood: getMoodFromIntensity(intensity) }
        : symptom
    );
    setSymptoms(updatedSymptoms);
    
    // Notify parent of data changes
    if (onDataChange) {
      const activeSymptoms = updatedSymptoms.filter(s => s.intensity > 0);
      const overallMood = activeSymptoms.length > 0 
        ? Math.round(activeSymptoms.reduce((sum, s) => sum + s.intensity, 0) / activeSymptoms.length)
        : 5;
      
      onDataChange({
        symptoms: activeSymptoms.map(s => ({
          symptomId: s.id,
          intensity: s.intensity,
          mood: s.mood
        })),
        overallMood
      });
    }
  };

  const resetSymptoms = () => {
    const resetSymptomData = symptoms.map(symptom => ({
      ...symptom,
      intensity: 0,
      mood: 'good' as const
    }));
    setSymptoms(resetSymptomData);
    setSelectedSymptom(null);
    
    // Notify parent of reset
    if (onDataChange) {
      onDataChange({ symptoms: [], overallMood: 5 });
    }
  };

  const saveSymptoms = () => {
    console.log('Saving symptoms:', symptoms);
  };

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    symptoms.forEach((symptom, index) => {
      const startAngle = (symptom.angle - 22.5) * Math.PI / 180;
      const endAngle = (symptom.angle + 22.5) * Math.PI / 180;
      
      // Calculate intensity-based radius
      const intensityRadius = radius * (0.3 + (symptom.intensity / 10) * 0.7);
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, intensityRadius, startAngle, endAngle);
      ctx.closePath();
      
      // Fill with mood color
      ctx.fillStyle = MOOD_COLORS[symptom.mood];
      ctx.globalAlpha = 0.7;
      ctx.fill();
      
      // Draw border
      ctx.globalAlpha = 1;
      ctx.strokeStyle = selectedSymptom === symptom.id ? '#1f2937' : '#6b7280';
      ctx.lineWidth = selectedSymptom === symptom.id ? 3 : 1;
      ctx.stroke();
      
      // Draw symptom label
      const labelAngle = symptom.angle * Math.PI / 180;
      const labelRadius = radius + 20;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(symptom.name, labelX, labelY);
      
      // Draw intensity number
      if (symptom.intensity > 0) {
        const numberRadius = intensityRadius * 0.7;
        const numberX = centerX + Math.cos(labelAngle) * numberRadius;
        const numberY = centerY + Math.sin(labelAngle) * numberRadius;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(symptom.intensity.toString(), numberX, numberY);
      }
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw center text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Symptom', centerX, centerY - 5);
    ctx.fillText('Tracker', centerX, centerY + 10);
    
  }, [symptoms, selectedSymptom]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate angle from center
    const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
    const normalizedAngle = angle < 0 ? angle + 360 : angle;
    
    // Find closest symptom
    let closestSymptom = null;
    let minDiff = Infinity;
    
    symptoms.forEach(symptom => {
      let diff = Math.abs(normalizedAngle - symptom.angle);
      if (diff > 180) diff = 360 - diff;
      
      if (diff < minDiff && diff < 22.5) {
        minDiff = diff;
        closestSymptom = symptom.id;
      }
    });
    
    if (closestSymptom) {
      setSelectedSymptom(closestSymptom);
    }
  };

  const selectedSymptomData = symptoms.find(s => s.id === selectedSymptom);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            Symptom Tracking Wheel
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetSymptoms}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={saveSymptoms}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Wheel Canvas */}
            <div className="flex flex-col items-center">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border border-gray-200 rounded-lg cursor-pointer"
                onClick={handleCanvasClick}
              />
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: MOOD_COLORS.good }}></div>
                  <span className="text-xs">Good (0-2)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: MOOD_COLORS.neutral }}></div>
                  <span className="text-xs">Mild (3-4)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: MOOD_COLORS.poor }}></div>
                  <span className="text-xs">Moderate (5-7)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: MOOD_COLORS.severe }}></div>
                  <span className="text-xs">Severe (8-10)</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {selectedSymptomData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedSymptomData.name}</h3>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        backgroundColor: MOOD_COLORS[selectedSymptomData.mood],
                        color: 'white',
                        borderColor: MOOD_COLORS[selectedSymptomData.mood]
                      }}
                    >
                      {selectedSymptomData.mood.charAt(0).toUpperCase() + selectedSymptomData.mood.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Intensity: {selectedSymptomData.intensity}/10
                    </label>
                    <Slider
                      value={[selectedSymptomData.intensity]}
                      onValueChange={(value) => updateSymptom(selectedSymptomData.id, value[0])}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Click on a symptom segment to track intensity</p>
                </div>
              )}

              {/* Symptom List */}
              <div className="space-y-2">
                <h4 className="font-medium">Quick Access:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {symptoms.map(symptom => (
                    <button
                      key={symptom.id}
                      onClick={() => setSelectedSymptom(symptom.id)}
                      className={`flex items-center justify-between p-2 rounded border text-left hover:bg-gray-50 ${
                        selectedSymptom === symptom.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="text-sm">{symptom.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{symptom.intensity}</span>
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: MOOD_COLORS[symptom.mood] }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}