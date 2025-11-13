import 'package:freezed_annotation/freezed_annotation.dart';

part 'loan_model.freezed.dart';
part 'loan_model.g.dart';

enum LoanType {
  @JsonValue('personal')
  personal,
  @JsonValue('auto')
  auto,
  @JsonValue('mortgage')
  mortgage,
  @JsonValue('business')
  business,
}

enum LoanStatus {
  @JsonValue('active')
  active,
  @JsonValue('paid_off')
  paidOff,
  @JsonValue('defaulted')
  defaulted,
  @JsonValue('pending')
  pending,
}

@freezed
class LoanModel with _$LoanModel {
  const factory LoanModel({
    required String id,
    required String userId,
    required LoanType type,
    required String loanNumber,
    required double principal,
    required double interestRate,
    required double remainingBalance,
    required DateTime nextPaymentDate,
    required double nextPaymentAmount,
    required int termMonths,
    required LoanStatus status,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _LoanModel;

  factory LoanModel.fromJson(Map<String, dynamic> json) =>
      _$LoanModelFromJson(json);
}

extension LoanTypeX on LoanType {
  String get displayName {
    switch (this) {
      case LoanType.personal:
        return 'Personal Loan';
      case LoanType.auto:
        return 'Auto Loan';
      case LoanType.mortgage:
        return 'Mortgage';
      case LoanType.business:
        return 'Business Loan';
    }
  }

  String get icon {
    switch (this) {
      case LoanType.personal:
        return '👤';
      case LoanType.auto:
        return '🚗';
      case LoanType.mortgage:
        return '🏠';
      case LoanType.business:
        return '💼';
    }
  }
}
