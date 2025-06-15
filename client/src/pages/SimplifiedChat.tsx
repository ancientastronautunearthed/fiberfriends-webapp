import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Users } from 'lucide-react';

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
}

interface ChatMessage {
  id: string;
  content: string;
  authorName: string;
  timestamp: string;
}

export default function SimplifiedChat() {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const { isConnected, sendMessage } = useWebSocket(
    `${protocol}//${window.location.host}/ws`,
    {
      onMessage: (message: any) => {
        if (message.type === 'new_message' && message.data) {
          const newMsg: ChatMessage = {
            id: message.data.id,
            content: message.data.content,
            authorName: message.data.authorName || 'Anonymous',
            timestamp: new Date(message.data.createdAt).toLocaleTimeString()
          };
          setMessages(prev => [...prev, newMsg]);
        }
      },
      onConnect: () => {
        console.log('Connected to chat server');
      },
      onDisconnect: () => {
        console.log('Disconnected from chat server');
      }
    }
  );

  const chatRooms: ChatRoom[] = [
    {
      id: 'general-support',
      name: 'General Support',
      description: 'General discussion and mutual support',
      category: 'support',
      memberCount: 12
    },
    {
      id: 'symptom-sharing',
      name: 'Symptom Sharing',
      description: 'Share and discuss symptoms',
      category: 'health',
      memberCount: 8
    },
    {
      id: 'diet-nutrition',
      name: 'Diet & Nutrition',
      description: 'Food logging and dietary discussions',
      category: 'nutrition',
      memberCount: 15
    },
    {
      id: 'treatment-experiences',
      name: 'Treatment Experiences',
      description: 'Share treatment outcomes and experiences',
      category: 'treatment',
      memberCount: 6
    }
  ];

  // Auto-join first room when component loads
  useEffect(() => {
    if (chatRooms.length > 0 && !activeRoom) {
      const firstRoom = chatRooms[0].id;
      setActiveRoom(firstRoom);
      if (isConnected) {
        sendMessage({
          type: 'join_room',
          data: { roomId: firstRoom }
        });
      }
    }
  }, [chatRooms, activeRoom, isConnected, sendMessage]);

  const handleRoomSelect = (roomId: string) => {
    if (activeRoom === roomId) return;
    
    // Leave current room
    if (activeRoom && isConnected) {
      sendMessage({
        type: 'leave_room',
        data: { roomId: activeRoom }
      });
    }
    
    // Join new room
    setActiveRoom(roomId);
    setMessages([]); // Clear messages when switching rooms
    
    if (isConnected) {
      sendMessage({
        type: 'join_room',
        data: { roomId }
      });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeRoom || !isConnected) return;
    
    sendMessage({
      type: 'send_message',
      data: {
        roomId: activeRoom,
        content: newMessage.trim(),
        authorName: user?.firstName || user?.email || 'Anonymous'
      }
    });
    
    setNewMessage('');
  };

  const getActiveRoomName = () => {
    const room = chatRooms.find(r => r.id === activeRoom);
    return room?.name || 'Select a room';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Community Chat</h1>
        <p className="text-slate-600 mt-2">
          Connect with other community members and share experiences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Chat Rooms Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Chat Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeRoom === room.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-slate-100'
                    }`}
                    onClick={() => handleRoomSelect(room.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-sm">{room.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {room.memberCount}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-75 line-clamp-2">
                      {room.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {getActiveRoomName()}
              <div className="ml-auto flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-slate-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900">
                          {message.authorName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {message.timestamp}
                        </span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-slate-700">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <Separator />

            {/* Message Input */}
            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    activeRoom
                      ? `Type a message in ${getActiveRoomName()}...`
                      : 'Select a room to start chatting...'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!activeRoom || !isConnected}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !activeRoom || !isConnected}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}