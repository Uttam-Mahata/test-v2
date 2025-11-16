import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { VoiceBiometricDto } from './dto/voice-biometric.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('otp/generate')
  @ApiOperation({ summary: 'Generate OTP for user' })
  @ApiResponse({ status: 200, description: 'OTP generated successfully' })
  async generateOtp(@CurrentUser('id') userId: string) {
    const otp = await this.authService.generateOtp(userId);
    return {
      otp,
      message: 'OTP generated successfully. Valid for 30 seconds.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  async verifyOtp(@CurrentUser('id') userId: string, @Body() verifyOtpDto: VerifyOtpDto) {
    const verified = await this.authService.verifyOtp(userId, verifyOtpDto);
    return {
      verified,
      message: verified ? 'OTP verified successfully' : 'Invalid OTP',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('pin/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify PIN for transaction authorization' })
  @ApiResponse({ status: 200, description: 'PIN verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid PIN' })
  async verifyPin(@CurrentUser('id') userId: string, @Body() verifyPinDto: VerifyPinDto) {
    const verified = await this.authService.verifyPin(userId, verifyPinDto.pin);
    return {
      verified,
      message: verified ? 'PIN verified successfully' : 'Invalid PIN',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('voice-biometric/enroll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enroll voice biometric' })
  @ApiResponse({ status: 200, description: 'Voice biometric enrolled successfully' })
  async enrollVoiceBiometric(
    @CurrentUser('id') userId: string,
    @Body() voiceBiometricDto: VoiceBiometricDto,
  ) {
    await this.authService.enrollVoiceBiometric(userId, voiceBiometricDto.voiceData);
    return {
      message: 'Voice biometric enrolled successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('voice-biometric/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify voice biometric' })
  @ApiResponse({ status: 200, description: 'Voice biometric verified' })
  async verifyVoiceBiometric(
    @CurrentUser('id') userId: string,
    @Body() voiceBiometricDto: VoiceBiometricDto,
  ) {
    const verified = await this.authService.verifyVoiceBiometric(userId, voiceBiometricDto.voiceData);
    return {
      verified,
      message: verified ? 'Voice biometric verified successfully' : 'Voice biometric verification failed',
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
