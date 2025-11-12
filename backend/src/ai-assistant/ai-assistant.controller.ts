import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiAssistantService } from './ai-assistant.service';

@ApiTags('ai-assistant')
@Controller('ai-assistant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get AI assistant configuration' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved successfully' })
  async getConfig() {
    return {
      data: {
        systemInstruction: this.aiAssistantService.getSystemInstruction(),
        functionDeclarations: this.aiAssistantService.getFunctionDeclarations(),
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        features: {
          voiceInput: true,
          voiceOutput: true,
          realtimeAudio: true,
          functionCalling: true,
        },
      },
    };
  }
}
