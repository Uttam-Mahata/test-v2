import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/exceptions.dart';
import '../models/account_model.dart';
import '../models/transaction_model.dart';

abstract class AccountRemoteDataSource {
  Future<List<AccountModel>> getAccounts();
  Future<AccountModel> getAccountById(String accountId);
  Future<List<TransactionModel>> getAccountTransactions(String accountId);
}

class AccountRemoteDataSourceImpl implements AccountRemoteDataSource {
  final Dio _dio;

  AccountRemoteDataSourceImpl(this._dio);

  @override
  Future<List<AccountModel>> getAccounts() async {
    try {
      final response = await _dio.get(ApiEndpoints.accounts);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => AccountModel.fromJson(json)).toList();
      }

      throw ServerException(
        message: 'Failed to fetch accounts',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to fetch accounts',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<AccountModel> getAccountById(String accountId) async {
    try {
      final response = await _dio.get('${ApiEndpoints.accounts}/$accountId');

      if (response.statusCode == 200) {
        return AccountModel.fromJson(response.data['data']);
      }

      throw ServerException(
        message: 'Failed to fetch account details',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to fetch account',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<List<TransactionModel>> getAccountTransactions(String accountId) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.transactionsByAccount(accountId),
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
}
