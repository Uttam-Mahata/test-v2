import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
  };
}

export interface OTPVerifyData {
  otp: string;
}

export interface PINVerifyData {
  pin: string;
}

export interface VoiceBiometricData {
  audioData: Blob;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout(): Promise<void> {
    apiClient.clearTokens();
  },

  async generateOTP(): Promise<{ message: string }> {
    return apiClient.get(API_ENDPOINTS.AUTH.OTP_GENERATE);
  },

  async verifyOTP(data: OTPVerifyData): Promise<{ success: boolean; message: string }> {
    return apiClient.post(API_ENDPOINTS.AUTH.OTP_VERIFY, data);
  },

  async verifyPIN(data: PINVerifyData): Promise<{ success: boolean; message: string }> {
    return apiClient.post(API_ENDPOINTS.AUTH.PIN_VERIFY, data);
  },

  async enrollVoiceBiometric(audioData: Blob): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('audio', audioData, 'voice-sample.wav');

    return apiClient.post(API_ENDPOINTS.AUTH.VOICE_ENROLL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async verifyVoiceBiometric(audioData: Blob): Promise<{ success: boolean; message: string; confidence?: number }> {
    const formData = new FormData();
    formData.append('audio', audioData, 'voice-verification.wav');

    return apiClient.post(API_ENDPOINTS.AUTH.VOICE_VERIFY, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
