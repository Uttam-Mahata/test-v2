import 'package:freezed_annotation/freezed_annotation.dart';

part 'transaction_model.freezed.dart';
part 'transaction_model.g.dart';

enum TransactionType {
  @JsonValue('debit')
  debit,
  @JsonValue('credit')
  credit,
}

enum TransactionStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('completed')
  completed,
  @JsonValue('failed')
  failed,
  @JsonValue('reversed')
  reversed,
}

@freezed
class TransactionModel with _$TransactionModel {
  const factory TransactionModel({
    required String id,
    required String accountId,
    required TransactionType type,
    required double amount,
    required String description,
    required String referenceNumber,
    required TransactionStatus status,
    String? fromAccountId,
    String? toAccountId,
    Map<String, dynamic>? metadata,
    required DateTime createdAt,
  }) = _TransactionModel;

  factory TransactionModel.fromJson(Map<String, dynamic> json) =>
      _$TransactionModelFromJson(json);
}

extension TransactionTypeX on TransactionType {
  String get displayName {
    switch (this) {
      case TransactionType.debit:
        return 'Debit';
      case TransactionType.credit:
        return 'Credit';
    }
  }

  bool get isPositive => this == TransactionType.credit;
}

extension TransactionStatusX on TransactionStatus {
  String get displayName {
    switch (this) {
      case TransactionStatus.pending:
        return 'Pending';
      case TransactionStatus.completed:
        return 'Completed';
      case TransactionStatus.failed:
        return 'Failed';
      case TransactionStatus.reversed:
        return 'Reversed';
    }
  }
}
