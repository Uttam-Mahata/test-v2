import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../data/models/payment_model.dart';

abstract class PaymentRepository {
  Future<Either<Failure, PaymentModel>> createPayment(
    Map<String, dynamic> paymentData,
  );
  Future<Either<Failure, bool>> verifyPin(String pin);
  Future<Either<Failure, List<PaymentModel>>> getPayments();
  Future<Either<Failure, PaymentModel>> getPaymentById(String paymentId);
}
