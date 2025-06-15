import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { generateAICompanionResponse } from "@/lib/api";

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
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Good morning! I see you've completed your morning symptom log. Your sleep quality seems to be improving - that's wonderful progress! How are you feeling about starting the day?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: "user",
      content: "Thanks Luna! I'm feeling pretty good today. I noticed my energy levels are higher this week.",
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: "ai",
      content: "That's fantastic to hear! Based on your recent logs, I've noticed a positive correlation between your improved sleep quality and higher energy levels. Would you like me to analyze any specific patterns or discuss strategies to maintain this progress?",
      timestamp: new Date(Date.now() - 27 * 60 * 1000).toISOString(),
    },
  ]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
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

  const { data: companion } = useQuery({
    queryKey: ["/api/ai-companion"],
    enabled: isAuthenticated,
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");

    try {
      // Generate AI response using Gemini
      const aiResponse = await generateAICompanionResponse(currentMessage, {
        recentMessages: messages.slice(-3),
        companionName: "Luna"
      });

      const aiMessage = {
        id: messages.length + 2,
        type: "ai" as const,
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the AI response if voice is enabled
      if (voiceEnabled) {
        speakText(aiResponse);
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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const companionName = companion?.companionName || "Luna";

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
            <Button onClick={handleSendMessage} disabled={!message.trim() || isListening}>
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
