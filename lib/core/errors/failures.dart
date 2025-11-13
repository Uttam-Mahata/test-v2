import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;
  final int? statusCode;
  final dynamic error;

  const Failure({
    required this.message,
    this.statusCode,
    this.error,
  });

  @override
  List<Object?> get props => [message, statusCode, error];
}

class ServerFailure extends Failure {
  const ServerFailure({
    required super.message,
    super.statusCode,
    super.error,
  });
}

class NetworkFailure extends Failure {
  const NetworkFailure({
    String message = 'No internet connection',
    super.error,
  }) : super(message: message);
}

class AuthenticationFailure extends Failure {
  const AuthenticationFailure({
    String message = 'Authentication failed',
    super.statusCode,
    super.error,
  }) : super(message: message);
}

class ValidationFailure extends Failure {
  const ValidationFailure({
    required super.message,
    super.statusCode,
    super.error,
  });
}

class CacheFailure extends Failure {
  const CacheFailure({
    String message = 'Cache error',
    super.error,
  }) : super(message: message);
}

class BiometricFailure extends Failure {
  const BiometricFailure({
    required super.message,
    super.error,
  });
}

class PermissionFailure extends Failure {
  const PermissionFailure({
    required super.message,
    super.error,
  });
}

class UnexpectedFailure extends Failure {
  const UnexpectedFailure({
    String message = 'An unexpected error occurred',
    super.error,
  }) : super(message: message);
}
