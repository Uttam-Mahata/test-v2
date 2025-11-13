class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Aarth Saarathi';
  static const String appTagline = 'Your AI Financial Companion';

  // API Endpoints
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api/v1',
  );

  static const String wsUrl = String.fromEnvironment(
    'WS_URL',
    defaultValue: 'ws://10.0.2.2:3000',
  );

  // Storage Keys
  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserData = 'user_data';
  static const String keyBiometricEnabled = 'biometric_enabled';
  static const String keyThemeMode = 'theme_mode';

  // API Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Voice Assistant
  static const Duration voiceTimeout = Duration(seconds: 5);
  static const String defaultVoiceLanguage = 'en-US';

  // Transaction Limits
  static const double minTransferAmount = 1.0;
  static const double maxTransferAmount = 100000.0;

  // PIN
  static const int pinLength = 4;
  static const int maxPinAttempts = 3;

  // OTP
  static const int otpLength = 6;
  static const Duration otpTimeout = Duration(seconds: 30);

  // Biometric
  static const String biometricReason = 'Authenticate to access your account';
}
