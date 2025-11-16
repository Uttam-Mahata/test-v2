import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/exceptions.dart';
import '../models/transaction_model.dart';

abstract class TransactionRemoteDataSource {
  Future<List<TransactionModel>> getTransactions({
    int? limit,
    // Note: Backend only supports 'limit' parameter
    // offset, type, startDate, endDate are not supported by backend API
  });
  Future<TransactionModel> getTransactionById(String transactionId);
}

class TransactionRemoteDataSourceImpl implements TransactionRemoteDataSource {
  final Dio _dio;

  TransactionRemoteDataSourceImpl(this._dio);

  @override
  Future<List<TransactionModel>> getTransactions({
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (limit != null) queryParams['limit'] = limit;

      final response = await _dio.get(
        ApiEndpoints.transactions,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => TransactionModel.fromJson(json)).toList();
      }

      throw ServerException(
        message: 'Failed to fetch transactions',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to fetch transactions',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<TransactionModel> getTransactionById(String transactionId) async {
    try {
      final response = await _dio.get(
        '${ApiEndpoints.transactions}/$transactionId',
      );

      if (response.statusCode == 200) {
        return TransactionModel.fromJson(response.data['data']);
      }

      throw ServerException(
        message: 'Failed to fetch transaction details',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to fetch transaction',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
