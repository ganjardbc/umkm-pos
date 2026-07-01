import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Get token from auth or headers
      let token = client.handshake.auth?.token || client.handshake.headers?.authorization;
      
      if (!token && client.handshake.query?.token) {
        token = client.handshake.query.token as string;
      }

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided (Client ID: ${client.id})`);
        client.disconnect();
        return;
      }

      // Handle Bearer prefix if present
      if (typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.substring(7);
      }

      // Verify JWT
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!userId) {
        this.logger.warn(`Connection rejected: Invalid token payload (Client ID: ${client.id})`);
        client.disconnect();
        return;
      }

      // Store user details in socket client data
      client.data.userId = userId;

      // Join personal room
      client.join(`user:${userId}`);

      // Join active outlet room if provided by the client
      const outletId = client.handshake.auth?.outlet_id || client.handshake.query?.outlet_id;
      if (outletId) {
        client.data.outletId = outletId;
        client.join(`outlet:${outletId}`);
        this.logger.log(`Client ${userId} connected and joined room: outlet:${outletId}`);
      } else {
        this.logger.log(`Client ${userId} connected to personal room (no outlet specified)`);
      }
    } catch (err) {
      this.logger.error(`Connection authentication failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Send to specific outlet room
  sendToOutlet(outletId: string, event: string, payload: any) {
    this.server.to(`outlet:${outletId}`).emit(event, payload);
  }

  // Send to specific user room
  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
