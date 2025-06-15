import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Plus,
  Wifi,
  WifiOff
} from 'lucide-react';
import { isUnauthorizedError } from '@/lib/authUtils';

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  category: string;
  memberCount: number;
  lastActivity: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  messageType: string;
  createdAt: string;
  authorName?: string;
  authorEmail?: string;
}

export default function Chat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if not authenticated
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

  // Fetch chat rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/chat/rooms'],
    enabled: isAuthenticated,
    retry: false,
  });

  // WebSocket connection
  const { isConnected, sendMessage } = useWebSocket('/ws/chat', {
    onMessage: (message) => {
      switch (message.type) {
        case 'room_joined':
          setMessages(message.data.messages || []);
          break;
        
        case 'new_message':
          setMessages(prev => [...prev, message.data]);
          scrollToBottom();
          break;
        
        case 'user_typing':
          if (message.data.userId !== user?.id) {
            setTypingUsers(prev => new Set([...prev, message.data.userId]));
          }
          break;
        
        case 'user_stopped_typing':
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(message.data.userId);
            return newSet;
          });
          break;
        
        case 'error':
          toast({
            title: "Chat Error",
            description: message.message,
            variant: "destructive",
          });
          break;
      }
    },
    onConnect: () => {
      console.log('Connected to chat server');
    },
    onDisconnect: () => {
      console.log('Disconnected from chat server');
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Join room
  const joinRoom = (roomId: string) => {
    if (!user || !isConnected) return;
    
    // Leave current room
    if (activeRoom) {
      sendMessage({
        type: 'leave_room',
        data: {}
      });
    }
    
    // Join new room
    sendMessage({
      type: 'join_room',
      data: { roomId, userId: user.id }
    });
    
    setActiveRoom(roomId);
    setMessages([]);
  };

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeRoom || !isConnected) return;
    
    sendMessage({
      type: 'send_message',
      data: {
        content: newMessage.trim(),
        messageType: 'text'
      }
    });
    
    setNewMessage('');
    stopTyping();
  };

  // Handle typing
  const handleTyping = () => {
    if (!activeRoom || !isConnected) return;
    
    sendMessage({
      type: 'typing',
      data: { roomId: activeRoom }
    });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (!activeRoom || !isConnected) return;
    
    sendMessage({
      type: 'stop_typing',
      data: { roomId: activeRoom }
    });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Create new room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (roomData: { name: string; description: string; category: string }) => {
      return await apiRequest("POST", "/api/chat/rooms", roomData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/rooms'] });
      toast({
        title: "Success",
        description: "Chat room created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive",
      });
    },
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getActiveRoomName = () => {
    const room = rooms.find((r: ChatRoom) => r.id === activeRoom);
    return room?.name || 'Select a room';
  };

  if (isLoading || roomsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Community Chat</h1>
          <p className="text-slate-600 mt-2">
            Connect with other community members in real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-slate-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Room List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Rooms
                </span>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <div className="space-y-2 p-4">
                  {rooms.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>No chat rooms yet</p>
                      <p className="text-sm">Create one to get started!</p>
                    </div>
                  ) : (
                    rooms.map((room: ChatRoom) => (
                      <div
                        key={room.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          activeRoom === room.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-slate-50 border-slate-200'
                        }`}
                        onClick={() => joinRoom(room.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{room.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {room.category}
                          </Badge>
                        </div>
                        {room.description && (
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {room.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{room.memberCount} members</span>
                          <span>{formatTime(room.lastActivity)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {getActiveRoomName()}
              </CardTitle>
            </CardHeader>
            
            {activeRoom ? (
              <>
                {/* Messages */}
                <CardContent className="flex-1 p-4">
                  <ScrollArea className="h-[420px]">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {message.authorName?.charAt(0) || message.authorEmail?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {message.authorName || message.authorEmail || 'Anonymous'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatTime(message.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700">{message.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {/* Typing indicator */}
                      {typingUsers.size > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span>{Array.from(typingUsers).join(', ')} typing...</span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                <Separator />

                {/* Message Input */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={!isConnected}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium mb-2">Select a chat room</h3>
                  <p className="text-sm">Choose a room from the sidebar to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}