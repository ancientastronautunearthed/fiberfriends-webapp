import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import type { ChatMessage, InsertChatMessage } from '@shared/schema';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  roomId?: string;
}

interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'send_message' | 'typing' | 'stop_typing';
  data: any;
}

export class ChatWebSocketServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/chat'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: AuthenticatedWebSocket) {
    console.log('New WebSocket connection');
    
    // For testing purposes, assign a mock user ID
    ws.userId = 'test-user-' + Math.random().toString(36).substr(2, 9);

    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
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
      this.handleDisconnection(ws);
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'join_room':
        await this.handleJoinRoom(ws, message.data);
        break;
      
      case 'leave_room':
        this.handleLeaveRoom(ws);
        break;
      
      case 'send_message':
        await this.handleSendMessage(ws, message.data);
        break;
      
      case 'typing':
        this.handleTyping(ws, message.data.roomId);
        break;
      
      case 'stop_typing':
        this.handleStopTyping(ws, message.data.roomId);
        break;
      
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  private async handleJoinRoom(ws: AuthenticatedWebSocket, data: any) {
    const { roomId, userId } = data;
    
    if (!roomId || !userId) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Room ID and User ID required' 
      }));
      return;
    }

    // Verify user is a member of the room
    const isMember = await storage.isRoomMember(roomId, userId);
    if (!isMember) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Not authorized to join this room' 
      }));
      return;
    }

    // Leave previous room if any
    this.handleLeaveRoom(ws);

    // Join new room
    ws.userId = userId;
    ws.roomId = roomId;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws);

    // Send recent messages
    const recentMessages = await storage.getChatMessages(roomId, 50);
    ws.send(JSON.stringify({
      type: 'room_joined',
      data: { roomId, messages: recentMessages }
    }));

    // Notify other users in the room
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      data: { userId, roomId }
    }, ws);

    console.log(`User ${userId} joined room ${roomId}`);
  }

  private handleLeaveRoom(ws: AuthenticatedWebSocket) {
    if (ws.roomId && ws.userId) {
      const roomClients = this.rooms.get(ws.roomId);
      if (roomClients) {
        roomClients.delete(ws);
        
        // Clean up empty rooms
        if (roomClients.size === 0) {
          this.rooms.delete(ws.roomId);
        }
      }

      // Stop typing if user was typing
      this.handleStopTyping(ws, ws.roomId);

      // Notify other users
      this.broadcastToRoom(ws.roomId, {
        type: 'user_left',
        data: { userId: ws.userId, roomId: ws.roomId }
      }, ws);

      console.log(`User ${ws.userId} left room ${ws.roomId}`);
      
      ws.roomId = undefined;
    }
  }

  private async handleSendMessage(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId || !ws.roomId) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Must join a room first' 
      }));
      return;
    }

    const { content, messageType = 'text', replyToId } = data;

    if (!content || content.trim().length === 0) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Message content cannot be empty' 
      }));
      return;
    }

    try {
      // Save message to database
      const messageData: InsertChatMessage = {
        roomId: ws.roomId,
        userId: ws.userId,
        content: content.trim(),
        messageType,
        replyToId: replyToId || null
      };

      const savedMessage = await storage.createChatMessage(messageData);

      // Get full message with user details
      const fullMessage = await storage.getChatMessageWithUser(savedMessage.id);

      // Broadcast to all room members
      this.broadcastToRoom(ws.roomId, {
        type: 'new_message',
        data: fullMessage
      });

      // Update room's last activity
      await storage.updateRoomActivity(ws.roomId);

      console.log(`Message sent in room ${ws.roomId} by user ${ws.userId}`);
    } catch (error) {
      console.error('Error saving message:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to send message' 
      }));
    }
  }

  private handleTyping(ws: AuthenticatedWebSocket, roomId: string) {
    if (!ws.userId || ws.roomId !== roomId) return;

    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    
    const typingSet = this.typingUsers.get(roomId)!;
    typingSet.add(ws.userId);

    // Broadcast typing indicator
    this.broadcastToRoom(roomId, {
      type: 'user_typing',
      data: { userId: ws.userId, roomId }
    }, ws);
  }

  private handleStopTyping(ws: AuthenticatedWebSocket, roomId: string) {
    if (!ws.userId || ws.roomId !== roomId) return;

    const typingSet = this.typingUsers.get(roomId);
    if (typingSet) {
      typingSet.delete(ws.userId);
      
      // Clean up empty typing sets
      if (typingSet.size === 0) {
        this.typingUsers.delete(roomId);
      }
    }

    // Broadcast stop typing
    this.broadcastToRoom(roomId, {
      type: 'user_stopped_typing',
      data: { userId: ws.userId, roomId }
    }, ws);
  }

  private handleDisconnection(ws: AuthenticatedWebSocket) {
    this.handleLeaveRoom(ws);
    console.log('WebSocket disconnected');
  }

  private broadcastToRoom(roomId: string, message: any, excludeWs?: AuthenticatedWebSocket) {
    const roomClients = this.rooms.get(roomId);
    if (!roomClients) return;

    const messageStr = JSON.stringify(message);
    
    roomClients.forEach(client => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  public getRoomMemberCount(roomId: string): number {
    return this.rooms.get(roomId)?.size || 0;
  }

  public getActiveRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}