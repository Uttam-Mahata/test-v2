import 'package:freezed_annotation/freezed_annotation.dart';

part 'account_model.freezed.dart';
part 'account_model.g.dart';

enum AccountType {
  @JsonValue('checking')
  checking,
  @JsonValue('savings')
  savings,
  @JsonValue('credit')
  credit,
}

@freezed
class AccountModel with _$AccountModel {
  const factory AccountModel({
    required String id,
    required String userId,
    required AccountType type,
    required String accountNumber,
    required double balance,
    double? limit,
    required String currency,
    required bool isActive,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _AccountModel;

  factory AccountModel.fromJson(Map<String, dynamic> json) =>
      _$AccountModelFromJson(json);
}

extension AccountTypeX on AccountType {
  String get displayName {
    switch (this) {
      case AccountType.checking:
        return 'Checking';
      case AccountType.savings:
        return 'Savings';
      case AccountType.credit:
        return 'Credit';
    }
  }

  String get icon {
    switch (this) {
      case AccountType.checking:
        return '💳';
      case AccountType.savings:
        return '💰';
      case AccountType.credit:
        return '🏦';
    }
  }
}
