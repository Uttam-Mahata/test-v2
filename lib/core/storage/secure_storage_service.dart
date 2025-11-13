import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class SecureStorageService {
  final FlutterSecureStorage _secureStorage;
  final SharedPreferences _prefs;

  SecureStorageService(this._secureStorage, this._prefs);

  // Access Token
  Future<void> saveAccessToken(String token) async {
    await _secureStorage.write(
      key: AppConstants.keyAccessToken,
      value: token,
    );
  }

  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: AppConstants.keyAccessToken);
  }

  // Refresh Token
  Future<void> saveRefreshToken(String token) async {
    await _secureStorage.write(
      key: AppConstants.keyRefreshToken,
      value: token,
    );
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: AppConstants.keyRefreshToken);
  }

  // User Data
  Future<void> saveUserData(String userData) async {
    await _secureStorage.write(
      key: AppConstants.keyUserData,
      value: userData,
    );
  }

  Future<String?> getUserData() async {
    return await _secureStorage.read(key: AppConstants.keyUserData);
  }

  // Biometric Enabled
  Future<void> setBiometricEnabled(bool enabled) async {
    await _prefs.setBool(AppConstants.keyBiometricEnabled, enabled);
  }

  Future<bool> isBiometricEnabled() async {
    return _prefs.getBool(AppConstants.keyBiometricEnabled) ?? false;
  }

  // Theme Mode
  Future<void> setThemeMode(String mode) async {
    await _prefs.setString(AppConstants.keyThemeMode, mode);
  }

  Future<String?> getThemeMode() async {
    return _prefs.getString(AppConstants.keyThemeMode);
  }

  // Clear Auth Data
  Future<void> clearAuthData() async {
    await _secureStorage.delete(key: AppConstants.keyAccessToken);
    await _secureStorage.delete(key: AppConstants.keyRefreshToken);
    await _secureStorage.delete(key: AppConstants.keyUserData);
  }

  // Clear All Data
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs.clear();
  }

  // Check if authenticated
  Future<bool> isAuthenticated() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
