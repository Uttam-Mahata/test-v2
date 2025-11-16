import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../data/models/user_model.dart';

abstract class AuthRepository {
  Future<Either<Failure, LoginResponse>> login(String email, String password);
  Future<Either<Failure, RegisterResponse>> register(Map<String, dynamic> data);
  Future<Either<Failure, void>> logout();
  Future<Either<Failure, bool>> isAuthenticated();
  Future<Either<Failure, UserModel>> getCurrentUser();
  Future<Either<Failure, bool>> verifyPin(String pin);
  Future<Either<Failure, String>> generateOtp();
  Future<Either<Failure, bool>> verifyOtp(String otp);
}
