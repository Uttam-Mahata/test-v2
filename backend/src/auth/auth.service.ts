import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.configService.get<number>('security.bcryptSaltRounds'),
    );

    const hashedPin = registerDto.pin
      ? await bcrypt.hash(registerDto.pin, this.configService.get<number>('security.bcryptSaltRounds'))
      : null;

    // Generate OTP secret
    const otpSecret = speakeasy.generateSecret({
      name: `AI Financial Assistant (${registerDto.email})`,
    }).base32;

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      pin: hashedPin,
      otpSecret,
    });

    const { password, pin, otpSecret: secret, ...result } = user;

    return {
      user: result,
      message: 'User registered successfully. Please verify your account.',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    await this.usersService.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user,
      message: 'Login successful',
    };
  }

  async generateOtp(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.otpSecret) {
      throw new BadRequestException('User not found or OTP not configured');
    }

    const token = speakeasy.totp({
      secret: user.otpSecret,
      encoding: 'base32',
    });

    return token;
  }

  async verifyOtp(userId: string, verifyOtpDto: VerifyOtpDto): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.otpSecret) {
      throw new BadRequestException('User not found or OTP not configured');
    }

    const verified = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: verifyOtpDto.otp,
      window: 2,
    });

    if (verified && !user.isVerified) {
      await this.usersService.update(userId, { isVerified: true });
    }

    return verified;
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.pin) {
      throw new BadRequestException('User not found or PIN not configured');
    }

    return await bcrypt.compare(pin, user.pin);
  }

  async enrollVoiceBiometric(userId: string, voiceData: any): Promise<void> {
    // Mock voice biometric enrollment
    // In production, this would process actual voice data using ML models
    const voiceBiometricData = {
      enrolledAt: new Date(),
      voiceprint: this.generateMockVoiceprint(voiceData),
      sampleCount: voiceData.samples?.length || 3,
    };

    await this.usersService.update(userId, { voiceBiometricData });
  }

  async verifyVoiceBiometric(userId: string, voiceData: any): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.voiceBiometricData) {
      throw new BadRequestException('Voice biometric not enrolled');
    }

    // Mock voice biometric verification
    // In production, this would compare voice samples using ML models
    const currentVoiceprint = this.generateMockVoiceprint(voiceData);
    const enrolledVoiceprint = user.voiceBiometricData.voiceprint;

    // Simulate similarity score (in production, this would be actual ML comparison)
    const similarity = this.calculateMockSimilarity(currentVoiceprint, enrolledVoiceprint);

    return similarity > 0.85; // 85% threshold
  }

  private generateMockVoiceprint(voiceData: any): string {
    // Mock voiceprint generation
    // In production, this would extract features from actual voice samples
    return Buffer.from(JSON.stringify(voiceData)).toString('base64').substring(0, 64);
  }

  private calculateMockSimilarity(voiceprint1: string, voiceprint2: string): number {
    // Mock similarity calculation
    // In production, this would use actual ML model comparison
    if (voiceprint1 === voiceprint2) return 1.0;

    let matches = 0;
    const length = Math.min(voiceprint1.length, voiceprint2.length);

    for (let i = 0; i < length; i++) {
      if (voiceprint1[i] === voiceprint2[i]) matches++;
    }

    return matches / length;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
      });

      return {
        accessToken: newAccessToken,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
