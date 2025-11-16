import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/exceptions.dart';
import '../../core/network/dio_client.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<LoginResponse> login(String email, String password);
  Future<RegisterResponse> register(Map<String, dynamic> data);
  Future<Map<String, dynamic>> refreshToken(String refreshToken);
  Future<bool> verifyPin(String pin);
  Future<String> generateOtp();
  Future<bool> verifyOtp(String otp);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient _dioClient;

  AuthRemoteDataSourceImpl(this._dioClient);

  @override
  Future<LoginResponse> login(String email, String password) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      return LoginResponse.fromJson(response.data['data'] ?? response.data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Login failed',
        statusCode: e.response?.statusCode,
        error: e,
      );
    }
  }

  @override
  Future<RegisterResponse> register(Map<String, dynamic> data) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.register,
        data: data,
      );

      return RegisterResponse.fromJson(response.data['data'] ?? response.data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Registration failed',
        statusCode: e.response?.statusCode,
        error: e,
      );
    }
  }

  @override
  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.refreshToken,
        data: {'refreshToken': refreshToken},
      );

      return response.data['data'];
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Token refresh failed',
        statusCode: e.response?.statusCode,
        error: e,
      );
    }
  }

  @override
  Future<bool> verifyPin(String pin) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.pinVerify,
        data: {'pin': pin},
      );

      return response.data['data']['verified'] ?? false;
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'PIN verification failed',
        statusCode: e.response?.statusCode,
        error: e,
      );
    }
  }

  @override
  Future<String> generateOtp() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.otpGenerate);
      return response.data['data']['otp'] ?? '';
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'OTP generation failed',
        statusCode: e.response?.statusCode,
        error: e,
      );
    }
  }

  @override
  Future<bool> verifyOtp(String otp) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.otpVerify,
        data: {'otp': otp},
      );

      return response.data['data']['verified'] ?? false;
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'OTP verification failed',
        statusCode: e.response?.statusCode,
        error: e,
      );
    }
  }
}
