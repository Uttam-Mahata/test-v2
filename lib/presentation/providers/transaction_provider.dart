import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/transaction_model.dart';
import '../../domain/repositories/transaction_repository.dart';

class TransactionState {
  final List<TransactionModel> transactions;
  final TransactionModel? selectedTransaction;
  final bool isLoading;
  final String? error;
  final String? filterType;
  final DateTime? startDate;
  final DateTime? endDate;

  TransactionState({
    this.transactions = const [],
    this.selectedTransaction,
    this.isLoading = false,
    this.error,
    this.filterType,
    this.startDate,
    this.endDate,
  });

  TransactionState copyWith({
    List<TransactionModel>? transactions,
    TransactionModel? selectedTransaction,
    bool? isLoading,
    String? error,
    String? filterType,
    DateTime? startDate,
    DateTime? endDate,
  }) {
    return TransactionState(
      transactions: transactions ?? this.transactions,
      selectedTransaction: selectedTransaction ?? this.selectedTransaction,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      filterType: filterType ?? this.filterType,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
    );
  }
}

class TransactionNotifier extends StateNotifier<TransactionState> {
  final TransactionRepository _transactionRepository;

  TransactionNotifier(this._transactionRepository) : super(TransactionState());

  Future<void> loadTransactions({
    int? limit,
    int? offset,
    String? type,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    state = state.copyWith(
      isLoading: true,
      error: null,
      filterType: type,
      startDate: startDate,
      endDate: endDate,
    );

    final result = await _transactionRepository.getTransactions(
      limit: limit,
      offset: offset,
      type: type,
      startDate: startDate,
      endDate: endDate,
    );

    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (transactions) {
        state = state.copyWith(
          transactions: transactions,
          isLoading: false,
          error: null,
        );
      },
    );
  }

  Future<void> selectTransaction(String transactionId) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _transactionRepository.getTransactionById(transactionId);

    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (transaction) {
        state = state.copyWith(
          selectedTransaction: transaction,
          isLoading: false,
          error: null,
        );
      },
    );
  }

  void clearFilters() {
    loadTransactions();
  }

  void clearSelection() {
    state = state.copyWith(selectedTransaction: null);
  }
}

final transactionProvider = StateNotifierProvider<TransactionNotifier, TransactionState>((ref) {
  throw UnimplementedError();
});

// Re-export from dependency injection
import '../../core/di/dependency_injection.dart' show transactionProviderImpl;

// Replace the unimplemented provider
final transactionProviderAlias = transactionProviderImpl;
