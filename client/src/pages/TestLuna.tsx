import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TestLuna() {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState("");
  const [generatedLuna, setGeneratedLuna] = useState<any>(null);

  const testPersonality = {
    tone: 'warm' as const,
    style: 'supportive' as const,
    personality: 'nurturing' as const,
    appearance: {
      hairColor: 'brown' as const,
      eyeColor: 'green' as const,
      style: 'casual' as const,
      outfit: 'casual_wear' as const,
      environment: 'cozy_room' as const
    }
  };

  const previewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/luna/preview", { personality: testPersonality });
      return response;
    },
    onSuccess: (data: any) => {
      setPreviewImage(data.imageUrl);
      toast({
        title: "Preview Generated",
        description: "Luna preview image created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Preview Failed",
        description: "Could not generate preview",
        variant: "destructive",
      });
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/luna/generate", { personality: testPersonality });
      return response;
    },
    onSuccess: (data: any) => {
      setGeneratedLuna(data);
      toast({
        title: "Luna Created",
        description: "Your AI companion has been successfully generated",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Could not create Luna",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Luna Creation Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Test Controls */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Test Personality Settings:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tone: Warm</li>
                  <li>• Style: Supportive</li>
                  <li>• Personality: Nurturing</li>
                  <li>• Hair: Brown</li>
                  <li>• Eyes: Green</li>
                  <li>• Style: Casual</li>
                  <li>• Outfit: Casual Wear</li>
                  <li>• Environment: Cozy Room</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => previewMutation.mutate()}
                  disabled={previewMutation.isPending}
                  className="w-full"
                >
                  {previewMutation.isPending ? "Generating Preview..." : "Test Preview API"}
                </Button>
                
                <Button 
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  {generateMutation.isPending ? "Creating Luna..." : "Test Full Generation"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            {/* Preview Image */}
            {previewImage && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Preview Image:</h3>
                <div className="w-32 h-32 border rounded-lg overflow-hidden">
                  <img 
                    src={previewImage} 
                    alt="Luna Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Generated Luna */}
            {generatedLuna && (
              <div>
                <h3 className="font-medium mb-2">Generated Luna:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border rounded-lg overflow-hidden">
                      <img 
                        src={generatedLuna.imageUrl} 
                        alt="Generated Luna" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{generatedLuna.name}</h4>
                      <p className="text-sm text-gray-600">{generatedLuna.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p><span className="font-medium">Communication Style:</span> {generatedLuna.communicationStyle}</p>
                    {generatedLuna.greeting && (
                      <p className="mt-2 p-3 bg-blue-50 rounded-lg italic">
                        "{generatedLuna.greeting}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}