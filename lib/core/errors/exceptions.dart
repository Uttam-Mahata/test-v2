class ServerException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic error;

  ServerException({
    required this.message,
    this.statusCode,
    this.error,
  });

  @override
  String toString() => 'ServerException: $message (Status: $statusCode)';
}

class NetworkException implements Exception {
  final String message;
  final dynamic error;

  NetworkException({
    this.message = 'No internet connection',
    this.error,
  });

  @override
  String toString() => 'NetworkException: $message';
}

class AuthenticationException implements Exception {
  final String message;
  final int? statusCode;

  AuthenticationException({
    this.message = 'Authentication failed',
    this.statusCode,
  });

  @override
  String toString() => 'AuthenticationException: $message';
}

class ValidationException implements Exception {
  final String message;
  final Map<String, dynamic>? errors;

  ValidationException({
    required this.message,
    this.errors,
  });

  @override
  String toString() => 'ValidationException: $message';
}

class CacheException implements Exception {
  final String message;

  CacheException({this.message = 'Cache error'});

  @override
  String toString() => 'CacheException: $message';
}

class BiometricException implements Exception {
  final String message;

  BiometricException({required this.message});

  @override
  String toString() => 'BiometricException: $message';
}

class PermissionException implements Exception {
  final String message;

  PermissionException({required this.message});

  @override
  String toString() => 'PermissionException: $message';
}
