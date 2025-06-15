import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface ChatWebSocket extends WebSocket {
  userId?: string;
  roomId?: string;
}

interface WebSocketMessage {
  type: string;
  data: any;
}

export class SimpleChatServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<ChatWebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: () => true // Allow all connections for testing
    });

    this.wss.on('connection', (ws: ChatWebSocket) => {
      console.log('New WebSocket connection established');
      
      // Assign test user ID
      ws.userId = 'user-' + Math.random().toString(36).substr(2, 9);
      
      ws.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        data: { message: 'Connected to chat server', userId: ws.userId }
      }));
    });

    console.log('Simple Chat WebSocket server initialized');
  }

  private handleMessage(ws: ChatWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'join_room':
        this.handleJoinRoom(ws, message.data);
        break;
      
      case 'leave_room':
        this.handleLeaveRoom(ws);
        break;
      
      case 'send_message':
        this.handleSendMessage(ws, message.data);
        break;
      
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  private handleJoinRoom(ws: ChatWebSocket, data: any) {
    const { roomId } = data;
    
    if (!roomId) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Room ID required' 
      }));
      return;
    }

    // Leave current room if any
    this.handleLeaveRoom(ws);

    // Join new room
    ws.roomId = roomId;
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws);

    // Send confirmation
    ws.send(JSON.stringify({
      type: 'joined_room',
      data: { roomId, message: `Joined room: ${roomId}` }
    }));

    // Broadcast user joined
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      data: { userId: ws.userId, roomId }
    }, ws);

    console.log(`User ${ws.userId} joined room ${roomId}`);
  }

  private handleLeaveRoom(ws: ChatWebSocket) {
    if (ws.roomId) {
      const roomClients = this.rooms.get(ws.roomId);
      if (roomClients) {
        roomClients.delete(ws);
        
        // Broadcast user left
        this.broadcastToRoom(ws.roomId, {
          type: 'user_left',
          data: { userId: ws.userId, roomId: ws.roomId }
        });
        
        // Clean up empty rooms
        if (roomClients.size === 0) {
          this.rooms.delete(ws.roomId);
        }
      }
      
      console.log(`User ${ws.userId} left room ${ws.roomId}`);
      ws.roomId = undefined;
    }
  }

  private handleSendMessage(ws: ChatWebSocket, data: any) {
    if (!ws.roomId) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Not in a room' 
      }));
      return;
    }

    const { content, authorName } = data;
    
    if (!content) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Message content required' 
      }));
      return;
    }

    // Create message
    const message = {
      id: Date.now().toString(),
      content,
      authorName: authorName || 'Anonymous',
      createdAt: new Date().toISOString(),
      roomId: ws.roomId
    };

    // Broadcast to all users in the room
    this.broadcastToRoom(ws.roomId, {
      type: 'new_message',
      data: message
    });

    console.log(`Message sent in room ${ws.roomId} by ${authorName || 'Anonymous'}`);
  }

  private handleDisconnection(ws: ChatWebSocket) {
    this.handleLeaveRoom(ws);
    console.log(`User ${ws.userId} disconnected`);
  }

  private broadcastToRoom(roomId: string, message: any, excludeWs?: ChatWebSocket) {
    const roomClients = this.rooms.get(roomId);
    if (roomClients) {
      roomClients.forEach((client) => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  public getRoomMemberCount(roomId: string): number {
    return this.rooms.get(roomId)?.size || 0;
  }

  public getActiveRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}