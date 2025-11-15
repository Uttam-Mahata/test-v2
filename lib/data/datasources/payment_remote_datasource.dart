import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/exceptions.dart';
import '../models/payment_model.dart';

abstract class PaymentRemoteDataSource {
  Future<TransferResponse> transferFunds(TransferRequest request);
  Future<Map<String, dynamic>> makeExternalPayment(PaymentRequest request);
}

class PaymentRemoteDataSourceImpl implements PaymentRemoteDataSource {
  final Dio _dio;

  PaymentRemoteDataSourceImpl(this._dio);

  @override
  Future<TransferResponse> transferFunds(TransferRequest request) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.transferFunds,
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        // Backend returns { data: TransferResponse }
        return TransferResponse.fromJson(response.data['data'] ?? response.data);
      }

      throw ServerException(
        message: 'Failed to transfer funds',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to transfer funds',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<Map<String, dynamic>> makeExternalPayment(PaymentRequest request) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.externalPayment,
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        // Backend returns payment response with confirmationNumber, etc.
        return response.data['data'] ?? response.data;
      }

      throw ServerException(
        message: 'Failed to make payment',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to make payment',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
