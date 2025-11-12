import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsArray } from 'class-validator';

export class VoiceBiometricDto {
  @ApiProperty({
    description: 'Voice data for biometric authentication (base64 audio or features)',
    example: { samples: ['sample1', 'sample2', 'sample3'], format: 'wav' },
  })
  @IsObject()
  voiceData: {
    samples?: string[];
    format?: string;
    duration?: number;
    features?: any;
  };
}
