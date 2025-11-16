import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../config/api.config';
import { User, DataResponse, MessageResponse } from '../types/types';

export interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
  email?: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<DataResponse<User>>(
      API_ENDPOINTS.USERS.PROFILE
    );
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.patch<DataResponse<User>>(
      API_ENDPOINTS.USERS.PROFILE,
      data
    );
    return response.data;
  },

  async deleteProfile(): Promise<string> {
    const response = await apiClient.delete<MessageResponse>(
      API_ENDPOINTS.USERS.PROFILE
    );
    return response.message;
  },
};
