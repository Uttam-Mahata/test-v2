import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../data/models/account_model.dart';
import '../../data/models/transaction_model.dart';

abstract class AccountRepository {
  Future<Either<Failure, List<AccountModel>>> getAccounts();
  Future<Either<Failure, AccountModel>> getAccountById(String accountId);
  Future<Either<Failure, List<TransactionModel>>> getAccountTransactions(
    String accountId,
  );
}
