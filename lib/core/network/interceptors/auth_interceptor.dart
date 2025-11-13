import 'package:dio/dio.dart';
import '../../constants/app_constants.dart';
import '../../storage/secure_storage_service.dart';

class AuthInterceptor extends Interceptor {
  final SecureStorageService _storageService;

  AuthInterceptor(this._storageService);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Skip auth for login, register, and refresh endpoints
    final skipAuth = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
    ].any((path) => options.path.contains(path));

    if (!skipAuth) {
      final token = await _storageService.getAccessToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expired, try to refresh
      try {
        final refreshToken = await _storageService.getRefreshToken();
        if (refreshToken != null) {
          final dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
          final response = await dio.post(
            '/auth/refresh',
            data: {'refreshToken': refreshToken},
          );

          if (response.statusCode == 200) {
            final newAccessToken = response.data['data']['accessToken'];
            await _storageService.saveAccessToken(newAccessToken);

            // Retry the original request with new token
            final opts = err.requestOptions;
            opts.headers['Authorization'] = 'Bearer $newAccessToken';
            final cloneReq = await dio.request(
              opts.path,
              options: Options(
                method: opts.method,
                headers: opts.headers,
              ),
              data: opts.data,
              queryParameters: opts.queryParameters,
            );
            return handler.resolve(cloneReq);
          }
        }
      } catch (e) {
        // Refresh failed, clear tokens
        await _storageService.clearAuthData();
        return handler.reject(err);
      }
    }

    return handler.next(err);
  }
}
