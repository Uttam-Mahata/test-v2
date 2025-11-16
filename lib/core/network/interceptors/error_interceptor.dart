import 'package:dio/dio.dart';
import '../../errors/exceptions.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        throw NetworkException(
          message: 'Connection timeout. Please check your internet connection.',
          error: err,
        );

      case DioExceptionType.badResponse:
        final statusCode = err.response?.statusCode;
        final message = err.response?.data['message'] ?? 'Server error occurred';

        if (statusCode == 401) {
          throw AuthenticationException(
            message: message,
            statusCode: statusCode,
          );
        } else if (statusCode == 400) {
          throw ValidationException(
            message: message,
            errors: err.response?.data['errors'],
          );
        } else {
          throw ServerException(
            message: message,
            statusCode: statusCode,
            error: err.response?.data,
          );
        }

      case DioExceptionType.cancel:
        throw ServerException(message: 'Request cancelled');

      case DioExceptionType.connectionError:
        throw NetworkException(
          message: 'No internet connection. Please check your network settings.',
          error: err,
        );

      default:
        throw ServerException(
          message: 'An unexpected error occurred',
          error: err,
        );
    }
  }
}
