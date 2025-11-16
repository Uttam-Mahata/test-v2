class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh';
  static const String otpGenerate = '/auth/otp/generate';
  static const String otpVerify = '/auth/otp/verify';
  static const String pinVerify = '/auth/pin/verify';
  static const String voiceBiometricEnroll = '/auth/voice-biometric/enroll';
  static const String voiceBiometricVerify = '/auth/voice-biometric/verify';

  // Users
  static const String userProfile = '/users/profile';
  static const String updateProfile = '/users/profile';

  // Accounts
  static const String accounts = '/accounts';
  static String accountById(String id) => '/accounts/$id';
  static String accountBalance(String id) => '/accounts/$id/balance';

  // Transactions
  static const String transactions = '/transactions';
  static String transactionsByAccount(String accountId) =>
      '/transactions/account/$accountId';
  static String transactionById(String id) => '/transactions/$id';

  // Note: Backend only supports 'limit' query parameter for transactions

  // Payments
  static const String transferFunds = '/payments/transfer';
  static const String externalPayment = '/payments/external';

  // Loans
  static const String loans = '/loans';
  static const String activeLoans = '/loans/active';
  static const String interestRates = '/loans/interest-rates';
  static String loanById(String id) => '/loans/$id';

  // AI Assistant
  static const String aiAssistantConfig = '/ai-assistant/config';
  static const String aiAssistantWs = '/ai-assistant';
}
