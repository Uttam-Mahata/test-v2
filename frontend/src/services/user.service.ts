import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
  email?: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.USERS.PROFILE);
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return apiClient.patch<User>(API_ENDPOINTS.USERS.PROFILE, data);
  },

  async deleteProfile(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.USERS.PROFILE);
  },
};
