import { io, Socket } from 'socket.io-client';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { apiClient } from './api.client';

export interface AIConfig {
  modelName: string;
  maxTokens: number;
  temperature: number;
  functionCallingEnabled: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface FunctionCall {
  name: string;
  arguments: any;
  result?: any;
}

class AIAssistantService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: ConversationMessage) => void)[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];
  private audioResponseHandlers: ((audioChunk: ArrayBuffer) => void)[] = [];
  private functionCallHandlers: ((functionCall: FunctionCall) => void)[] = [];

  async getConfig(): Promise<AIConfig> {
    return apiClient.get<AIConfig>(API_ENDPOINTS.AI_ASSISTANT.CONFIG);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('accessToken');

      this.socket = io(API_CONFIG.WS_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to AI Assistant WebSocket');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('message', (data: ConversationMessage) => {
        this.messageHandlers.forEach(handler => handler(data));
      });

      this.socket.on('audio-response', (audioChunk: ArrayBuffer) => {
        this.audioResponseHandlers.forEach(handler => handler(audioChunk));
      });

      this.socket.on('function-call', (functionCall: FunctionCall) => {
        this.functionCallHandlers.forEach(handler => handler(functionCall));
      });

      this.socket.on('error', (error: any) => {
        const err = new Error(error.message || 'AI Assistant error');
        this.errorHandlers.forEach(handler => handler(err));
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from AI Assistant WebSocket');
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: string) {
    if (!this.socket || !this.socket.connected) {
      throw new Error('WebSocket is not connected');
    }

    this.socket.emit('message', {
      role: 'user',
      content: message,
      timestamp: new Date(),
    });
  }

  sendAudioChunk(audioChunk: ArrayBuffer) {
    if (!this.socket || !this.socket.connected) {
      throw new Error('WebSocket is not connected');
    }

    this.socket.emit('audio-chunk', audioChunk);
  }

  executeFunctionCall(functionCall: FunctionCall, result: any) {
    if (!this.socket || !this.socket.connected) {
      throw new Error('WebSocket is not connected');
    }

    this.socket.emit('function-call-result', {
      ...functionCall,
      result,
    });
  }

  onMessage(handler: (message: ConversationMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onAudioResponse(handler: (audioChunk: ArrayBuffer) => void) {
    this.audioResponseHandlers.push(handler);
    return () => {
      this.audioResponseHandlers = this.audioResponseHandlers.filter(h => h !== handler);
    };
  }

  onFunctionCall(handler: (functionCall: FunctionCall) => void) {
    this.functionCallHandlers.push(handler);
    return () => {
      this.functionCallHandlers = this.functionCallHandlers.filter(h => h !== handler);
    };
  }

  onError(handler: (error: Error) => void) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const aiAssistantService = new AIAssistantService();
