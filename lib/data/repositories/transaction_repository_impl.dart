import 'package:dartz/dartz.dart';
import '../../core/errors/exceptions.dart';
import '../../core/errors/failures.dart';
import '../../domain/repositories/transaction_repository.dart';
import '../datasources/transaction_remote_datasource.dart';
import '../models/transaction_model.dart';

class TransactionRepositoryImpl implements TransactionRepository {
  final TransactionRemoteDataSource _remoteDataSource;

  TransactionRepositoryImpl(this._remoteDataSource);

  @override
  Future<Either<Failure, List<TransactionModel>>> getTransactions({
    int? limit,
    int? offset,
    String? type,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final transactions = await _remoteDataSource.getTransactions(
        limit: limit,
        offset: offset,
        type: type,
        startDate: startDate,
        endDate: endDate,
      );
      return Right(transactions);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message));
    } catch (e) {
      return Left(ServerFailure(message: 'Unexpected error occurred'));
    }
  }

  @override
  Future<Either<Failure, TransactionModel>> getTransactionById(
    String transactionId,
  ) async {
    try {
      final transaction = await _remoteDataSource.getTransactionById(transactionId);
      return Right(transaction);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message));
    } catch (e) {
      return Left(ServerFailure(message: 'Unexpected error occurred'));
    }
  }
}
