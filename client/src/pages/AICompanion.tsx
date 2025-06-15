import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Mic, MicOff, Volume2, VolumeX, Calendar, Heart, Activity, Apple } from "lucide-react";
import { generateAICompanionResponse, getConversationHistoryForUser, getAICompanionPersonality } from "@/lib/api";

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

export default function AICompanion() {
  const { user, isAuthenticated, isLoading } = useFirebaseAuth();
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [companion, setCompanion] = useState<any>(null);

  // Load AI companion data from Firebase
  const { data: companionData, isLoading: companionLoading } = useQuery({
    queryKey: ["ai-companion", user?.uid],
    queryFn: () => getAICompanionPersonality(user?.uid),
    enabled: isAuthenticated && !!user?.uid
  });

  // Load conversation history from Firebase
  const { data: conversationHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["conversation-history", user?.uid],
    queryFn: () => getConversationHistoryForUser(user?.uid),
    enabled: isAuthenticated && !!user?.uid
  });

  // Initialize companion and conversation history
  useEffect(() => {
    if (companionData) {
      setCompanion(companionData);
    }
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const formattedMessages = conversationHistory.map((msg, index) => ({
        id: index + 1,
        type: msg.messageType,
        content: msg.content,
        timestamp: msg.createdAt || new Date().toISOString(),
        metadata: msg.metadata
      }));
      setMessages(formattedMessages);
    } else if (!historyLoading && (!conversationHistory || conversationHistory.length === 0)) {
      // Initialize with proactive welcome message offering daily overview
      setMessages([{
        id: 1,
        type: "ai" as const,
        content: "Good morning! I'm Luna, your AI health companion with specialized knowledge in Morgellons disease management. I'm here to support you on your health journey.\n\nWould you like me to provide your daily task overview, or is there something specific you'd like to discuss about your symptoms, diet, or wellbeing today?",
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [companionData, conversationHistory, historyLoading]);

  // Redirect to home if not authenticated  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your AI companion.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Voice Recognition Error",
            description: "Unable to capture voice input. Please try again.",
            variant: "destructive",
          });
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
      
      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        synthesisRef.current = window.speechSynthesis;
      }
    }
  }, [toast]);

  // Voice interaction functions
  const speakText = (text: string) => {
    if (!voiceEnabled || !synthesisRef.current) return;
    
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    const voices = synthesisRef.current.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('sarah') ||
      voice.name.toLowerCase().includes('samantha')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast({
        title: "Voice Recognition Error",
        description: "Unable to start voice recognition. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isSpeaking && synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || message;
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = messageToSend;
    setMessage("");

    try {
      // Get current user context from symptom wheel and health data
      const userContext = {
        recentMood: "cautiously optimistic",
        sleepQuality: "moderate",
        symptomLevel: "mild",
        energyLevel: "moderate",
        stressLevel: "low"
      };

      // Generate AI response with enhanced context
      const aiResponse = await generateAICompanionResponse(currentMessage, {
        conversationHistory: messages.slice(-10), // Send last 10 messages for context
        memoryContext: {
          previousTopics: ["symptom tracking", "daily routines"],
          userPreferences: { responseStyle: "supportive", focusAreas: ["emotional support"] }
        },
        conversationStyle: companion?.conversationStyle || "supportive",
        preferences: {
          personality: companion?.personality || "empathetic",
          communicationStyle: companion?.communicationStyle || "conversational",
          focusAreas: companion?.focusAreas || ["symptom management", "emotional support"]
        },
        userContext
      });

      // Handle structured response format
      const responseContent = typeof aiResponse === 'object' && aiResponse.response 
        ? aiResponse.response 
        : typeof aiResponse === 'string' 
        ? aiResponse 
        : "I'm here to support you on your health journey.";

      const aiMessage = {
        id: messages.length + 2,
        type: "ai" as const,
        content: responseContent,
        timestamp: new Date().toISOString(),
        metadata: aiResponse?.responseType ? {
          responseType: aiResponse.responseType,
          sentiment: aiResponse.sentiment,
          confidence: aiResponse.confidence
        } : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the AI response if voice is enabled
      if (voiceEnabled) {
        speakText(responseContent);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      const fallbackMessage = {
        id: messages.length + 2,
        type: "ai" as const,
        content: "I'm here to support you. Sometimes I have trouble connecting, but I'm always listening when you need to talk. How are you feeling right now?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      
      if (voiceEnabled) {
        speakText(fallbackMessage.content);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (actionType: string) => {
    const quickActionMessages = {
      daily_overview: "Could you provide me with my daily task overview? I'd like to see what I should focus on today for my health journey.",
      health_checkin: "I'd like to do a health check-in. Can you guide me through how I'm feeling and any symptoms I should track today?",
      symptom_discussion: "I want to discuss my current symptoms. Can you help me understand patterns and provide insights about what I'm experiencing?",
      nutrition_tips: "I'm looking for nutrition advice specifically for managing Morgellons symptoms. What anti-inflammatory foods should I focus on today?"
    };

    const messageText = quickActionMessages[actionType as keyof typeof quickActionMessages];
    if (messageText) {
      setMessage(messageText);
      // Auto-send the message
      await handleSendMessage(messageText);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const companionName = "Luna";

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{companionName}</h2>
              <p className="text-purple-100">Your AI Health Companion</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.type === "user" ? "justify-end" : ""}`}>
              {msg.type === "ai" && (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`p-4 rounded-lg max-w-xs lg:max-w-md ${
                msg.type === "ai" 
                  ? "bg-slate-100 rounded-tl-none" 
                  : "bg-primary text-white rounded-tr-none"
              }`}>
                <p className={msg.type === "ai" ? "text-slate-800" : "text-white"}>{msg.content}</p>
                <span className={`text-xs mt-2 block ${
                  msg.type === "ai" ? "text-slate-500" : "text-primary-100"
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {msg.type === "user" && (
                <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <p className="text-sm text-slate-600 mb-3">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("daily_overview")}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Daily Task Overview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("health_checkin")}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Health Check-in
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("symptom_discussion")}
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Discuss Symptoms
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("nutrition_tips")}
                className="flex items-center gap-2"
              >
                <Apple className="w-4 h-4" />
                Nutrition Tips
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-slate-200 p-6">
          {/* Voice Controls */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className="flex items-center gap-2"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? "Stop Listening" : "Voice Input"}
            </Button>
            
            <Button
              variant={voiceEnabled ? "outline" : "secondary"}
              size="sm"
              onClick={toggleVoice}
              className="flex items-center gap-2"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {voiceEnabled ? "Voice On" : "Voice Off"}
            </Button>
            
            {isSpeaking && (
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                Luna is speaking...
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Type your message or use voice input..."}
              className="flex-1"
              disabled={isListening}
            />
            <Button onClick={() => handleSendMessage()} disabled={!message.trim() || isListening}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-slate-500">
              {companionName} is designed to provide supportive conversation and insights, not medical advice.
            </p>
            {isListening && (
              <p className="text-xs text-purple-600 font-medium">
                Speak now...
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
