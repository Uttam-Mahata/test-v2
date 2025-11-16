import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/ai-assistant',
})
export class AiAssistantGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AiAssistantGateway.name);

  constructor(private aiAssistantService: AiAssistantService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('function-call')
  async handleFunctionCall(
    @MessageBody() data: { functionName: string; args: any; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Function call received: ${data.functionName}`);

    const result = await this.aiAssistantService.handleFunctionCall(
      data.functionName,
      data.args,
      data.userId,
    );

    client.emit('function-response', {
      functionName: data.functionName,
      result,
    });

    return result;
  }

  @SubscribeMessage('audio-chunk')
  async handleAudioChunk(
    @MessageBody() data: { audio: any; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Handle real-time audio streaming if needed
    // This would integrate with Google GenAI's live audio API
    this.logger.debug('Audio chunk received');
  }
}
