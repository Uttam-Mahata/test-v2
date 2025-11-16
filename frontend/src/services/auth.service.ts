import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import { AuthResponse, RegisterResponse } from '../types/types';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  pin?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OTPGenerateResponse {
  otp: string;
  message: string;
}

export interface VerifyResponse {
  verified: boolean;
  message: string;
}

export interface OTPVerifyData {
  otp: string;
}

export interface PINVerifyData {
  pin: string;
}

export interface VoiceBiometricData {
  voiceData: string; // base64 encoded audio
}

export const authService = {
  async register(data: RegisterData): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout(): Promise<void> {
    apiClient.clearTokens();
  },

  async generateOTP(): Promise<OTPGenerateResponse> {
    return apiClient.get<OTPGenerateResponse>(API_ENDPOINTS.AUTH.OTP_GENERATE);
  },

  async verifyOTP(data: OTPVerifyData): Promise<VerifyResponse> {
    return apiClient.post<VerifyResponse>(API_ENDPOINTS.AUTH.OTP_VERIFY, data);
  },

  async verifyPIN(data: PINVerifyData): Promise<VerifyResponse> {
    return apiClient.post<VerifyResponse>(API_ENDPOINTS.AUTH.PIN_VERIFY, data);
  },

  async enrollVoiceBiometric(voiceData: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.VOICE_ENROLL,
      { voiceData }
    );
  },

  async verifyVoiceBiometric(voiceData: string): Promise<VerifyResponse> {
    return apiClient.post<VerifyResponse>(
      API_ENDPOINTS.AUTH.VOICE_VERIFY,
      { voiceData }
    );
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  loadTokens() {
    apiClient.loadTokensFromStorage();
  },
};
