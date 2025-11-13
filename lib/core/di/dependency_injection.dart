import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/dio_client.dart';
import '../storage/biometric_service.dart';
import '../storage/secure_storage_service.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/datasources/account_remote_datasource.dart';
import '../../data/datasources/transaction_remote_datasource.dart';
import '../../data/datasources/payment_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/repositories/account_repository_impl.dart';
import '../../data/repositories/transaction_repository_impl.dart';
import '../../data/repositories/payment_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/account_repository.dart';
import '../../domain/repositories/transaction_repository.dart';
import '../../domain/repositories/payment_repository.dart';
import '../../presentation/providers/auth_provider.dart';
import '../../presentation/providers/account_provider.dart';
import '../../presentation/providers/transaction_provider.dart';
import '../../presentation/providers/payment_provider.dart';
import '../../presentation/providers/voice_assistant_provider.dart';

// Storage Providers
final flutterSecureStorageProvider = Provider<FlutterSecureStorage>(
  (ref) => const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  ),
);

final sharedPreferencesProvider = FutureProvider<SharedPreferences>(
  (ref) => SharedPreferences.getInstance(),
);

final secureStorageServiceProvider = Provider<SecureStorageService>((ref) {
  final secureStorage = ref.watch(flutterSecureStorageProvider);
  final sharedPrefs = ref.watch(sharedPreferencesProvider).value;

  if (sharedPrefs == null) {
    throw Exception('SharedPreferences not initialized');
  }

  return SecureStorageService(secureStorage, sharedPrefs);
});

// Biometric Provider
final localAuthProvider = Provider<LocalAuthentication>(
  (ref) => LocalAuthentication(),
);

final biometricServiceProvider = Provider<BiometricService>((ref) {
  final localAuth = ref.watch(localAuthProvider);
  return BiometricService(localAuth);
});

// Network Providers
final dioClientProvider = Provider<DioClient>((ref) {
  final storageService = ref.watch(secureStorageServiceProvider);
  return DioClient(storageService);
});

final dioProvider = Provider<Dio>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return dioClient.dio;
});

// Data Source Providers
final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthRemoteDataSourceImpl(dio);
});

final accountRemoteDataSourceProvider = Provider<AccountRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return AccountRemoteDataSourceImpl(dio);
});

final transactionRemoteDataSourceProvider = Provider<TransactionRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return TransactionRemoteDataSourceImpl(dio);
});

final paymentRemoteDataSourceProvider = Provider<PaymentRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return PaymentRemoteDataSourceImpl(dio);
});

// Repository Providers
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final remoteDataSource = ref.watch(authRemoteDataSourceProvider);
  final storageService = ref.watch(secureStorageServiceProvider);
  return AuthRepositoryImpl(remoteDataSource, storageService);
});

final accountRepositoryProvider = Provider<AccountRepository>((ref) {
  final remoteDataSource = ref.watch(accountRemoteDataSourceProvider);
  return AccountRepositoryImpl(remoteDataSource);
});

final transactionRepositoryProvider = Provider<TransactionRepository>((ref) {
  final remoteDataSource = ref.watch(transactionRemoteDataSourceProvider);
  return TransactionRepositoryImpl(remoteDataSource);
});

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  final remoteDataSource = ref.watch(paymentRemoteDataSourceProvider);
  return PaymentRepositoryImpl(remoteDataSource);
});

// State Notifier Providers
final authProviderImpl = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  final storageService = ref.watch(secureStorageServiceProvider);
  return AuthNotifier(authRepository, storageService);
});

final accountProviderImpl = StateNotifierProvider<AccountNotifier, AccountState>((ref) {
  final accountRepository = ref.watch(accountRepositoryProvider);
  return AccountNotifier(accountRepository);
});

final transactionProviderImpl = StateNotifierProvider<TransactionNotifier, TransactionState>((ref) {
  final transactionRepository = ref.watch(transactionRepositoryProvider);
  return TransactionNotifier(transactionRepository);
});

final paymentProviderImpl = StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  final paymentRepository = ref.watch(paymentRepositoryProvider);
  return PaymentNotifier(paymentRepository);
});

final voiceAssistantProviderImpl = StateNotifierProvider<VoiceAssistantNotifier, VoiceAssistantState>((ref) {
  final storageService = ref.watch(secureStorageServiceProvider);
  return VoiceAssistantNotifier(storageService);
});
