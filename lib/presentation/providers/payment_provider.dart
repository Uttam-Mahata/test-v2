import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/payment_model.dart';
import '../../domain/repositories/payment_repository.dart';

class PaymentState {
  final List<PaymentModel> payments;
  final PaymentModel? currentPayment;
  final bool isLoading;
  final bool isPinVerified;
  final String? error;
  final String? successMessage;

  PaymentState({
    this.payments = const [],
    this.currentPayment,
    this.isLoading = false,
    this.isPinVerified = false,
    this.error,
    this.successMessage,
  });

  PaymentState copyWith({
    List<PaymentModel>? payments,
    PaymentModel? currentPayment,
    bool? isLoading,
    bool? isPinVerified,
    String? error,
    String? successMessage,
  }) {
    return PaymentState(
      payments: payments ?? this.payments,
      currentPayment: currentPayment ?? this.currentPayment,
      isLoading: isLoading ?? this.isLoading,
      isPinVerified: isPinVerified ?? this.isPinVerified,
      error: error,
      successMessage: successMessage,
    );
  }

  PaymentState clearMessages() {
    return copyWith(
      error: null,
      successMessage: null,
    );
  }
}

class PaymentNotifier extends StateNotifier<PaymentState> {
  final PaymentRepository _paymentRepository;

  PaymentNotifier(this._paymentRepository) : super(PaymentState());

  Future<bool> verifyPin(String pin) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _paymentRepository.verifyPin(pin);

    return result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          isPinVerified: false,
          error: failure.message,
        );
        return false;
      },
      (isValid) {
        state = state.copyWith(
          isLoading: false,
          isPinVerified: isValid,
          error: isValid ? null : 'Invalid PIN',
        );
        return isValid;
      },
    );
  }

  Future<bool> createPayment({
    required String fromAccountId,
    required String toAccountNumber,
    required double amount,
    required String description,
  }) async {
    if (!state.isPinVerified) {
      state = state.copyWith(error: 'Please verify PIN first');
      return false;
    }

    state = state.copyWith(isLoading: true, error: null);

    final paymentData = {
      'fromAccountId': fromAccountId,
      'toAccountNumber': toAccountNumber,
      'amount': amount,
      'description': description,
    };

    final result = await _paymentRepository.createPayment(paymentData);

    return result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
        return false;
      },
      (payment) {
        state = state.copyWith(
          currentPayment: payment,
          isLoading: false,
          error: null,
          successMessage: 'Payment successful!',
          isPinVerified: false, // Reset PIN verification
        );
        return true;
      },
    );
  }

  Future<void> loadPayments() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _paymentRepository.getPayments();

    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (payments) {
        state = state.copyWith(
          payments: payments,
          isLoading: false,
          error: null,
        );
      },
    );
  }

  void resetPinVerification() {
    state = state.copyWith(isPinVerified: false);
  }

  void clearMessages() {
    state = state.clearMessages();
  }
}

final paymentProvider = StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  throw UnimplementedError();
});
