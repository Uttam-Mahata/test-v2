import 'package:local_auth/local_auth.dart';
import '../constants/app_constants.dart';
import '../errors/exceptions.dart';

class BiometricService {
  final LocalAuthentication _localAuth;

  BiometricService(this._localAuth);

  // Check if device supports biometrics
  Future<bool> isDeviceSupported() async {
    try {
      return await _localAuth.isDeviceSupported();
    } catch (e) {
      throw BiometricException(
        message: 'Failed to check device support: ${e.toString()}',
      );
    }
  }

  // Check if biometrics are available
  Future<bool> canCheckBiometrics() async {
    try {
      return await _localAuth.canCheckBiometrics;
    } catch (e) {
      throw BiometricException(
        message: 'Failed to check biometrics availability: ${e.toString()}',
      );
    }
  }

  // Get available biometrics
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      throw BiometricException(
        message: 'Failed to get available biometrics: ${e.toString()}',
      );
    }
  }

  // Authenticate with biometrics
  Future<bool> authenticate({
    String? reason,
    bool useErrorDialogs = true,
    bool stickyAuth = true,
  }) async {
    try {
      final canCheck = await canCheckBiometrics();
      if (!canCheck) {
        throw BiometricException(
          message: 'Biometric authentication is not available on this device',
        );
      }

      return await _localAuth.authenticate(
        localizedReason: reason ?? AppConstants.biometricReason,
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          biometricOnly: true,
        ),
      );
    } catch (e) {
      if (e is BiometricException) rethrow;
      throw BiometricException(
        message: 'Biometric authentication failed: ${e.toString()}',
      );
    }
  }

  // Stop authentication
  Future<void> stopAuthentication() async {
    try {
      await _localAuth.stopAuthentication();
    } catch (e) {
      // Ignore errors when stopping
    }
  }
}
