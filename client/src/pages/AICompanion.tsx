import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function AICompanion() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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

  const { data: companion } = useQuery({
    queryKey: ["/api/ai-companion"],
    enabled: isAuthenticated,
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "I understand what you're going through. It's important to track these patterns and celebrate the small victories. Would you like to discuss any specific symptoms you're experiencing today?",
        "That's a great observation! Maintaining consistency with your routine seems to be helping. How has your nutrition been lately?",
        "Thank you for sharing that with me. Remember that progress isn't always linear, and it's okay to have ups and downs. What matters is that you're taking active steps to manage your health.",
        "I'm here to support you on this journey. Based on your recent logs, I can see you're making thoughtful choices about your health. Is there anything specific you'd like to focus on this week?",
      ];

      const aiMessage = {
        id: messages.length + 2,
        type: "ai" as const,
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1500);

    toast({
      title: "Message sent!",
      description: "Luna is thinking of a response...",
    });
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
          <div className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {companionName} is designed to provide supportive conversation and insights, not medical advice.
          </p>
        </div>
      </Card>
    </div>
  );
}
