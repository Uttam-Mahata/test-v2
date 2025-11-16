import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/di/dependency_injection.dart';
import '../../data/models/user_model.dart';

// Auth State
class AuthState {
  final bool isAuthenticated;
  final UserModel? user;
  final bool isLoading;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.user,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    UserModel? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final Ref ref;

  AuthNotifier(this.ref) : super(AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    final authRepo = ref.read(authRepositoryProvider);
    final result = await authRepo.isAuthenticated();

    result.fold(
      (failure) => state = state.copyWith(isAuthenticated: false),
      (isAuth) async {
        if (isAuth) {
          final userResult = await authRepo.getCurrentUser();
          userResult.fold(
            (failure) => state = state.copyWith(isAuthenticated: false),
            (user) => state = state.copyWith(
              isAuthenticated: true,
              user: user,
            ),
          );
        } else {
          state = state.copyWith(isAuthenticated: false);
        }
      },
    );
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    final authRepo = ref.read(authRepositoryProvider);
    final result = await authRepo.login(email, password);

    return result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
        return false;
      },
      (loginResponse) {
        state = state.copyWith(
          isAuthenticated: true,
          user: loginResponse.user,
          isLoading: false,
          error: null,
        );
        return true;
      },
    );
  }

  Future<bool> register(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);

    final authRepo = ref.read(authRepositoryProvider);
    final result = await authRepo.register(data);

    return result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
        return false;
      },
      (registerResponse) {
        state = state.copyWith(
          isLoading: false,
          error: null,
        );
        return true;
      },
    );
  }

  Future<void> logout() async {
    final authRepo = ref.read(authRepositoryProvider);
    await authRepo.logout();
    state = AuthState();
  }

  Future<bool> verifyPin(String pin) async {
    final authRepo = ref.read(authRepositoryProvider);
    final result = await authRepo.verifyPin(pin);

    return result.fold(
      (failure) => false,
      (verified) => verified,
    );
  }
}

// Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});
