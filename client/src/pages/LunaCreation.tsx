import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Heart, 
  Brain, 
  Zap, 
  Shield, 
  ArrowRight, 
  ArrowLeft,
  Palette,
  Eye,
  User,
  Shirt,
  MapPin,
  Wand2
} from "lucide-react";

interface LunaPersonality {
  tone: 'warm' | 'professional' | 'playful' | 'gentle' | 'energetic';
  style: 'supportive' | 'analytical' | 'motivational' | 'empathetic' | 'practical';
  personality: 'nurturing' | 'scientific' | 'encouraging' | 'calm' | 'enthusiastic';
  appearance: {
    hairColor: 'blonde' | 'brown' | 'black' | 'red' | 'silver' | 'blue';
    eyeColor: 'blue' | 'brown' | 'green' | 'hazel' | 'purple' | 'amber';
    style: 'professional' | 'casual' | 'artistic' | 'futuristic' | 'natural';
    outfit: 'lab_coat' | 'casual_wear' | 'business_attire' | 'artistic_clothing' | 'nature_inspired';
    environment: 'medical_office' | 'cozy_room' | 'garden' | 'tech_space' | 'peaceful_sanctuary';
  };
}

interface LunaCreationProps {
  onComplete: (luna: any) => void;
  onBack: () => void;
}

export default function LunaCreation({ onComplete, onBack }: LunaCreationProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  
  const [personality, setPersonality] = useState<LunaPersonality>({
    tone: 'warm',
    style: 'supportive',
    personality: 'nurturing',
    appearance: {
      hairColor: 'brown',
      eyeColor: 'blue',
      style: 'professional',
      outfit: 'lab_coat',
      environment: 'medical_office'
    }
  });

  const generatePreview = useMutation({
    mutationFn: async (personalityData: LunaPersonality) => {
      const response = await apiRequest("POST", "/api/luna/preview", { personality: personalityData });
      return response;
    },
    onSuccess: (data: any) => {
      setPreviewImage(data.imageUrl);
    }
  });

  const generateLuna = useMutation({
    mutationFn: async (personalityData: LunaPersonality) => {
      const response = await apiRequest("POST", "/api/luna/generate", { personality: personalityData });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Luna Created Successfully!",
        description: "Your personalized AI companion is ready to help you.",
      });
      onComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Error Creating Luna",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const steps = [
    {
      title: "Communication Tone",
      subtitle: "How would you like Luna to speak with you?",
      icon: <Heart className="w-6 h-6" />,
      options: [
        { value: 'warm', label: 'Warm & Caring', description: 'Like a caring friend who truly understands', icon: '🤗' },
        { value: 'professional', label: 'Professional', description: 'Clinical and evidence-based approach', icon: '👩‍⚕️' },
        { value: 'playful', label: 'Playful & Fun', description: 'Light-hearted and encouraging', icon: '😊' },
        { value: 'gentle', label: 'Gentle & Soft', description: 'Calm and reassuring presence', icon: '🕊️' },
        { value: 'energetic', label: 'Energetic', description: 'Enthusiastic and motivating', icon: '⚡' }
      ]
    },
    {
      title: "Support Style",
      subtitle: "What kind of support do you prefer?",
      icon: <Brain className="w-6 h-6" />,
      options: [
        { value: 'supportive', label: 'Supportive', description: 'Focus on emotional support and encouragement', icon: '🤝' },
        { value: 'analytical', label: 'Analytical', description: 'Data-driven insights and patterns', icon: '📊' },
        { value: 'motivational', label: 'Motivational', description: 'Goal-oriented and achievement focused', icon: '🎯' },
        { value: 'empathetic', label: 'Empathetic', description: 'Deep understanding and emotional connection', icon: '💝' },
        { value: 'practical', label: 'Practical', description: 'Actionable advice and concrete steps', icon: '🛠️' }
      ]
    },
    {
      title: "Personality Type",
      subtitle: "Which personality resonates with you?",
      icon: <Sparkles className="w-6 h-6" />,
      options: [
        { value: 'nurturing', label: 'Nurturing', description: 'Protective and caring, like a supportive mentor', icon: '🌱' },
        { value: 'scientific', label: 'Scientific', description: 'Curious and knowledge-focused researcher', icon: '🔬' },
        { value: 'encouraging', label: 'Encouraging', description: 'Optimistic cheerleader for your journey', icon: '📣' },
        { value: 'calm', label: 'Calm', description: 'Peaceful and centered meditation guide', icon: '🧘‍♀️' },
        { value: 'enthusiastic', label: 'Enthusiastic', description: 'Passionate and excited wellness coach', icon: '🌟' }
      ]
    },
    {
      title: "Hair Color",
      subtitle: "Choose Luna's hair color",
      icon: <Palette className="w-6 h-6" />,
      options: [
        { value: 'blonde', label: 'Blonde', description: 'Light and bright', icon: '👱‍♀️' },
        { value: 'brown', label: 'Brown', description: 'Warm and natural', icon: '👩' },
        { value: 'black', label: 'Black', description: 'Classic and elegant', icon: '👩‍🦱' },
        { value: 'red', label: 'Red', description: 'Vibrant and unique', icon: '👩‍🦰' },
        { value: 'silver', label: 'Silver', description: 'Wise and sophisticated', icon: '👵' },
        { value: 'blue', label: 'Blue', description: 'Creative and modern', icon: '💙' }
      ]
    },
    {
      title: "Eye Color",
      subtitle: "Select Luna's eye color",
      icon: <Eye className="w-6 h-6" />,
      options: [
        { value: 'blue', label: 'Blue', description: 'Calm and trustworthy', icon: '💙' },
        { value: 'brown', label: 'Brown', description: 'Warm and comforting', icon: '🤎' },
        { value: 'green', label: 'Green', description: 'Natural and peaceful', icon: '💚' },
        { value: 'hazel', label: 'Hazel', description: 'Mysterious and wise', icon: '🌰' },
        { value: 'purple', label: 'Purple', description: 'Magical and intuitive', icon: '💜' },
        { value: 'amber', label: 'Amber', description: 'Warm and golden', icon: '🟡' }
      ]
    },
    {
      title: "Overall Style",
      subtitle: "What style appeals to you?",
      icon: <User className="w-6 h-6" />,
      options: [
        { value: 'professional', label: 'Professional', description: 'Clean and clinical appearance', icon: '💼' },
        { value: 'casual', label: 'Casual', description: 'Relaxed and approachable', icon: '👕' },
        { value: 'artistic', label: 'Artistic', description: 'Creative and expressive', icon: '🎨' },
        { value: 'futuristic', label: 'Futuristic', description: 'Modern and tech-forward', icon: '🚀' },
        { value: 'natural', label: 'Natural', description: 'Earth-toned and organic', icon: '🌿' }
      ]
    },
    {
      title: "Outfit Choice",
      subtitle: "How should Luna dress?",
      icon: <Shirt className="w-6 h-6" />,
      options: [
        { value: 'lab_coat', label: 'Lab Coat', description: 'Medical professional attire', icon: '🥼' },
        { value: 'casual_wear', label: 'Casual Wear', description: 'Comfortable everyday clothes', icon: '👚' },
        { value: 'business_attire', label: 'Business Attire', description: 'Professional suit or blouse', icon: '👔' },
        { value: 'artistic_clothing', label: 'Artistic Clothing', description: 'Creative and colorful outfits', icon: '🎭' },
        { value: 'nature_inspired', label: 'Nature Inspired', description: 'Earth tones and natural fabrics', icon: '🍃' }
      ]
    },
    {
      title: "Environment",
      subtitle: "Where would you like to meet Luna?",
      icon: <MapPin className="w-6 h-6" />,
      options: [
        { value: 'medical_office', label: 'Medical Office', description: 'Clinical and professional setting', icon: '🏥' },
        { value: 'cozy_room', label: 'Cozy Room', description: 'Warm and comfortable space', icon: '🏠' },
        { value: 'garden', label: 'Garden', description: 'Natural outdoor environment', icon: '🌺' },
        { value: 'tech_space', label: 'Tech Space', description: 'Modern digital environment', icon: '💻' },
        { value: 'peaceful_sanctuary', label: 'Peaceful Sanctuary', description: 'Meditation and wellness space', icon: '🕯️' }
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updatePersonality = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPersonality(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof LunaPersonality] as any),
          [child]: value
        }
      }));
    } else {
      setPersonality(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Generate preview when appearance changes
    if (field.includes('appearance') && currentStep >= 3) {
      const newPersonality = { ...personality };
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        (newPersonality[parent as keyof LunaPersonality] as any) = {
          ...(newPersonality[parent as keyof LunaPersonality] as any),
          [child]: value
        };
      }
      generatePreview.mutate(newPersonality);
    }
  };

  const getCurrentValue = (field: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return (personality[parent as keyof LunaPersonality] as any)?.[child];
    }
    return personality[field as keyof LunaPersonality];
  };

  const getFieldName = (stepIndex: number) => {
    const fieldMap = [
      'tone',
      'style', 
      'personality',
      'appearance.hairColor',
      'appearance.eyeColor',
      'appearance.style',
      'appearance.outfit',
      'appearance.environment'
    ];
    return fieldMap[stepIndex];
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateLuna();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleCreateLuna = async () => {
    setIsGenerating(true);
    try {
      await generateLuna.mutateAsync(personality);
    } finally {
      setIsGenerating(false);
    }
  };

  const isStepComplete = () => {
    const fieldName = getFieldName(currentStep);
    const value = getCurrentValue(fieldName);
    return value !== undefined && value !== '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wand2 className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Create Your Luna
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Let's personalize your AI health companion to match your preferences
          </p>
          
          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              
              {/* Step Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{currentStepData.title}</h2>
                  <p className="text-gray-600">{currentStepData.subtitle}</p>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentStepData.options.map((option) => {
                  const fieldName = getFieldName(currentStep);
                  const isSelected = getCurrentValue(fieldName) === option.value;
                  
                  return (
                    <div
                      key={option.value}
                      onClick={() => updatePersonality(fieldName, option.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 shadow-lg' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>
                            {option.label}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                        {isSelected && (
                          <div className="p-1 bg-purple-500 rounded-full">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {currentStep === 0 ? 'Back to Profile' : 'Previous'}
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!isStepComplete() || isGenerating}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {currentStep === steps.length - 1 ? (
                    isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Luna...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Create Luna
                      </>
                    )
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Luna Preview
              </h3>
              
              {/* Avatar Preview */}
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Luna Preview" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Preview will appear as you customize</p>
                  </div>
                )}
                {generatePreview.isPending && (
                  <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                )}
              </div>

              {/* Current Selections */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tone:</span>
                  <Badge variant="outline" className="capitalize">{personality.tone}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Style:</span>
                  <Badge variant="outline" className="capitalize">{personality.style}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Personality:</span>
                  <Badge variant="outline" className="capitalize">{personality.personality}</Badge>
                </div>
                {currentStep >= 3 && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hair:</span>
                      <Badge variant="outline" className="capitalize">{personality.appearance.hairColor}</Badge>
                    </div>
                  </div>
                )}
                {currentStep >= 4 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eyes:</span>
                    <Badge variant="outline" className="capitalize">{personality.appearance.eyeColor}</Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}