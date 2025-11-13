import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/account_model.dart';
import '../../data/models/transaction_model.dart';
import '../../domain/repositories/account_repository.dart';

class AccountState {
  final List<AccountModel> accounts;
  final AccountModel? selectedAccount;
  final List<TransactionModel> accountTransactions;
  final bool isLoading;
  final String? error;

  AccountState({
    this.accounts = const [],
    this.selectedAccount,
    this.accountTransactions = const [],
    this.isLoading = false,
    this.error,
  });

  AccountState copyWith({
    List<AccountModel>? accounts,
    AccountModel? selectedAccount,
    List<TransactionModel>? accountTransactions,
    bool? isLoading,
    String? error,
  }) {
    return AccountState(
      accounts: accounts ?? this.accounts,
      selectedAccount: selectedAccount ?? this.selectedAccount,
      accountTransactions: accountTransactions ?? this.accountTransactions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  double get totalBalance {
    return accounts.fold(0.0, (sum, account) => sum + account.balance);
  }
}

class AccountNotifier extends StateNotifier<AccountState> {
  final AccountRepository _accountRepository;

  AccountNotifier(this._accountRepository) : super(AccountState());

  Future<void> loadAccounts() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _accountRepository.getAccounts();

    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (accounts) {
        state = state.copyWith(
          accounts: accounts,
          isLoading: false,
          error: null,
        );
      },
    );
  }

  Future<void> selectAccount(String accountId) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _accountRepository.getAccountById(accountId);

    result.fold(
      (failure) {
        state = state.copyWith(
          isLoading: false,
          error: failure.message,
        );
      },
      (account) {
        state = state.copyWith(
          selectedAccount: account,
          isLoading: false,
          error: null,
        );
        loadAccountTransactions(accountId);
      },
    );
  }

  Future<void> loadAccountTransactions(String accountId) async {
    final result = await _accountRepository.getAccountTransactions(accountId);

    result.fold(
      (failure) {
        state = state.copyWith(error: failure.message);
      },
      (transactions) {
        state = state.copyWith(
          accountTransactions: transactions,
          error: null,
        );
      },
    );
  }

  void clearSelection() {
    state = state.copyWith(
      selectedAccount: null,
      accountTransactions: [],
    );
  }
}

// Re-export from dependency injection
export '../../core/di/dependency_injection.dart' show accountProviderImpl;

// Alias for easier usage
final accountProvider = accountProviderImpl;
