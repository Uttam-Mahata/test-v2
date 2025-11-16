import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../data/models/transaction_model.dart';

abstract class TransactionRepository {
  Future<Either<Failure, List<TransactionModel>>> getTransactions({
    int? limit,
    int? offset,
    String? type,
    DateTime? startDate,
    DateTime? endDate,
  });
  Future<Either<Failure, TransactionModel>> getTransactionById(
    String transactionId,
  );
}
