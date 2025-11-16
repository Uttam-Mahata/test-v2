import 'package:freezed_annotation/freezed_annotation.dart';
import 'account_model.dart';
import 'transaction_model.dart';

part 'payment_model.freezed.dart';
part 'payment_model.g.dart';

@freezed
class TransferRequest with _$TransferRequest {
  const factory TransferRequest({
    required AccountType fromAccountType,
    required AccountType toAccountType,
    required double amount,
    required String pin,
    String? description,
  }) = _TransferRequest;

  factory TransferRequest.fromJson(Map<String, dynamic> json) =>
      _$TransferRequestFromJson(json);

  Map<String, dynamic> toJson() => {
        'fromAccountType': fromAccountType.name,
        'toAccountType': toAccountType.name,
        'amount': amount,
        'pin': pin,
        if (description != null) 'description': description,
      };
}

@freezed
class TransferResponse with _$TransferResponse {
  const factory TransferResponse({
    required bool success,
    required String message,
    required String confirmationNumber,
    required double amount,
    required AccountInfo fromAccount,
    required AccountInfo toAccount,
    required TransferTransactions transactions,
  }) = _TransferResponse;

  factory TransferResponse.fromJson(Map<String, dynamic> json) =>
      _$TransferResponseFromJson(json);
}

@freezed
class AccountInfo with _$AccountInfo {
  const factory AccountInfo({
    required String id,
    required AccountType type,
    required double newBalance,
  }) = _AccountInfo;

  factory AccountInfo.fromJson(Map<String, dynamic> json) =>
      _$AccountInfoFromJson(json);
}

@freezed
class TransferTransactions with _$TransferTransactions {
  const factory TransferTransactions({
    required TransactionModel debit,
    required TransactionModel credit,
  }) = _TransferTransactions;

  factory TransferTransactions.fromJson(Map<String, dynamic> json) =>
      _$TransferTransactionsFromJson(json);
}

@freezed
class PaymentRequest with _$PaymentRequest {
  const factory PaymentRequest({
    required AccountType accountType,
    required double amount,
    required String recipient,
    required String pin,
    String? description,
  }) = _PaymentRequest;

  factory PaymentRequest.fromJson(Map<String, dynamic> json) =>
      _$PaymentRequestFromJson(json);

  Map<String, dynamic> toJson() => {
        'accountType': accountType.name,
        'amount': amount,
        'recipient': recipient,
        'pin': pin,
        if (description != null) 'description': description,
      };
}
