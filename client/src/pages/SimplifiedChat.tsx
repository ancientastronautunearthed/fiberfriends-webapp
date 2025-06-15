import { useState } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
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
  const { user } = useFirebaseAuth();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

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
      name: 'Symptom Experiences',
      description: 'Share and discuss symptom experiences',
      category: 'symptoms',
      memberCount: 8
    },
    {
      id: 'treatment-tips',
      name: 'Treatment & Tips',
      description: 'Share treatment approaches',
      category: 'treatment',
      memberCount: 15
    }
  ];

  const sampleMessages: ChatMessage[] = [
    {
      id: '1',
      content: 'Welcome to the community chat! Feel free to share your experiences.',
      authorName: 'Community Moderator',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString()
    },
    {
      id: '2',
      content: 'Thank you for creating this safe space for discussion.',
      authorName: user?.firstName || user?.email || 'Member',
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString()
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeRoom) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      authorName: user?.firstName || user?.email || 'You',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getActiveRoomName = () => {
    const room = chatRooms.find(r => r.id === activeRoom);
    return room?.name || 'Select a room';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
          <p className="text-slate-600">You need to be signed in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Community Chat</h1>
        <p className="text-slate-600 mt-2">
          Connect with other community members and share experiences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Room List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Chat Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <div className="space-y-2 p-4">
                  {chatRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        activeRoom === room.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-slate-50 border-slate-200'
                      }`}
                      onClick={() => setActiveRoom(room.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{room.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {room.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                        {room.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{room.memberCount} members</span>
                      </div>
                    </div>
                  ))}
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
                      {messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {message.authorName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {message.authorName}
                              </span>
                              <span className="text-xs text-slate-500">
                                {message.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">{message.content}</p>
                          </div>
                        </div>
                      ))}
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