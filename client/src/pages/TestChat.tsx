import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  authorName: string;
  timestamp: string;
}

export default function TestChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState('general-support');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Attempting to connect to:', wsUrl);
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        
        // Join default room
        wsRef.current?.send(JSON.stringify({
          type: 'join_room',
          data: { roomId: activeRoom }
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          
          if (message.type === 'new_message' && message.data) {
            const newMsg: ChatMessage = {
              id: message.data.id,
              content: message.data.content,
              authorName: message.data.authorName || 'Anonymous',
              timestamp: new Date(message.data.createdAt).toLocaleTimeString()
            };
            setMessages(prev => [...prev, newMsg]);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected || !wsRef.current) return;
    
    const message = {
      type: 'send_message',
      data: {
        roomId: activeRoom,
        content: newMessage.trim(),
        authorName: 'Test User'
      }
    };
    
    console.log('Sending message:', message);
    wsRef.current.send(JSON.stringify(message));
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Test Chat</h1>
        <p className="text-slate-600 mt-2">
          Real-time chat testing interface
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              General Support Room
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
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                    <p className="text-xs mt-2">
                      Connection status: {isConnected ? 'Connected' : 'Disconnected'}
                    </p>
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
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    isConnected
                      ? 'Type a message...'
                      : 'Waiting for connection...'
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!isConnected}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Press Enter to send • Connection: {isConnected ? 'Active' : 'Inactive'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}