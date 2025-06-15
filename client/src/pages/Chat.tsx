import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
  Plus
} from 'lucide-react';

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
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle authentication loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
          <p className="text-slate-600">You need to be signed in to access the chat.</p>
        </div>
      </div>
    );
  }

  // Fetch chat rooms using Firestore
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ['chat-rooms'],
    queryFn: async () => {
      // For now, return mock rooms to test the interface
      const mockRooms: ChatRoom[] = [
        {
          id: 'general-support',
          name: 'General Support',
          description: 'General discussion and mutual support for community members',
          category: 'support',
          memberCount: 12,
          lastActivity: new Date().toISOString()
        },
        {
          id: 'symptom-sharing',
          name: 'Symptom Experiences',
          description: 'Share and discuss symptom experiences in a safe space',
          category: 'symptoms',
          memberCount: 8,
          lastActivity: new Date().toISOString()
        },
        {
          id: 'treatment-tips',
          name: 'Treatment & Tips',
          description: 'Share treatment approaches and helpful tips',
          category: 'treatment',
          memberCount: 15,
          lastActivity: new Date().toISOString()
        }
      ];
      return mockRooms;
    },
    enabled: isAuthenticated,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Join room
  const joinRoom = (roomId: string) => {
    if (!user) return;
    
    setActiveRoom(roomId);
    
    // Mock messages for the selected room
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        roomId: roomId,
        userId: 'other-user',
        content: 'Welcome to the chat room! Feel free to share your experiences.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        authorName: 'Community Member',
      },
      {
        id: '2',
        roomId: roomId,
        userId: user.id,
        content: 'Thank you! Happy to be here.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        authorName: user.firstName || user.email || 'You',
      }
    ];
    
    setMessages(mockMessages);
    scrollToBottom();
  };

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeRoom || !user) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      roomId: activeRoom,
      userId: user.id,
      content: newMessage.trim(),
      messageType: 'text',
      createdAt: new Date().toISOString(),
      authorName: user.firstName || user.email || 'You',
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    scrollToBottom();
  };

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
            Connect with other community members and share experiences
          </p>
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
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
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