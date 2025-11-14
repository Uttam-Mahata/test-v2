export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    OTP_GENERATE: '/auth/otp/generate',
    OTP_VERIFY: '/auth/otp/verify',
    PIN_VERIFY: '/auth/pin/verify',
    VOICE_ENROLL: '/auth/voice-biometric/enroll',
    VOICE_VERIFY: '/auth/voice-biometric/verify',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
  },

  // Accounts
  ACCOUNTS: {
    BASE: '/accounts',
    BALANCE: (id: string) => `/accounts/${id}/balance`,
  },

  // Transactions
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ACCOUNT: (accountId: string) => `/transactions/account/${accountId}`,
  },

  // Payments
  PAYMENTS: {
    TRANSFER: '/payments/transfer',
    EXTERNAL: '/payments/external',
  },

  // Loans
  LOANS: {
    BASE: '/loans',
    ACTIVE: '/loans/active',
    INTEREST_RATES: '/loans/interest-rates',
  },

  // AI Assistant
  AI_ASSISTANT: {
    CONFIG: '/ai-assistant/config',
  },
};
