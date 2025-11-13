import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/exceptions.dart';
import '../models/payment_model.dart';

abstract class PaymentRemoteDataSource {
  Future<PaymentModel> createPayment(Map<String, dynamic> paymentData);
  Future<bool> verifyPinForPayment(String pin);
  Future<List<PaymentModel>> getPayments();
  Future<PaymentModel> getPaymentById(String paymentId);
}

class PaymentRemoteDataSourceImpl implements PaymentRemoteDataSource {
  final Dio _dio;

  PaymentRemoteDataSourceImpl(this._dio);

  @override
  Future<PaymentModel> createPayment(Map<String, dynamic> paymentData) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.payments,
        data: paymentData,
      );

      if (response.statusCode == 201) {
        return PaymentModel.fromJson(response.data['data']);
      }

      throw ServerException(
        message: 'Failed to create payment',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to create payment',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<bool> verifyPinForPayment(String pin) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.verifyPin,
        data: {'pin': pin},
      );

      return response.statusCode == 200;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        return false;
      }
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to verify PIN',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<List<PaymentModel>> getPayments() async {
    try {
      final response = await _dio.get(ApiEndpoints.payments);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => PaymentModel.fromJson(json)).toList();
      }

      throw ServerException(
        message: 'Failed to fetch payments',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to fetch payments',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<PaymentModel> getPaymentById(String paymentId) async {
    try {
      final response = await _dio.get(
        '${ApiEndpoints.payments}/$paymentId',
      );

      if (response.statusCode == 200) {
        return PaymentModel.fromJson(response.data['data']);
      }

      throw ServerException(
        message: 'Failed to fetch payment details',
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Failed to fetch payment',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
