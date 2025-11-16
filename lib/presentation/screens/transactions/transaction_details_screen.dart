import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../providers/transaction_provider.dart';

class TransactionDetailsScreen extends ConsumerStatefulWidget {
  final String transactionId;

  const TransactionDetailsScreen({
    super.key,
    required this.transactionId,
  });

  @override
  ConsumerState<TransactionDetailsScreen> createState() =>
      _TransactionDetailsScreenState();
}

class _TransactionDetailsScreenState
    extends ConsumerState<TransactionDetailsScreen> {
  @override
  void initState() {
    super.initState();
    // Load transaction details when screen opens
    Future.microtask(() {
      ref.read(transactionProvider.notifier).selectTransaction(widget.transactionId);
    });
  }

  @override
  void dispose() {
    // Clear selection when leaving
    ref.read(transactionProvider.notifier).clearSelection();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final transactionState = ref.watch(transactionProvider);
    final transaction = transactionState.selectedTransaction;
    final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    final dateTimeFormat = DateFormat('MMMM dd, yyyy • h:mm a');

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Transaction Details',
          style: GoogleFonts.inter(fontWeight: FontWeight.w600),
        ),
        elevation: 0,
        actions: [
          if (transaction != null)
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: () => _shareTransaction(transaction),
            ),
        ],
      ),
      body: transactionState.isLoading && transaction == null
          ? const Center(child: CircularProgressIndicator())
          : transactionState.error != null && transaction == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 64,
                        color: Colors.red.shade300,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        transactionState.error!,
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          color: Colors.red.shade300,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : transaction == null
                  ? const Center(child: Text('Transaction not found'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Status Icon
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: _getStatusColor(transaction.status)
                                  .withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _getStatusIcon(transaction.status),
                              size: 60,
                              color: _getStatusColor(transaction.status),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Amount
                          Text(
                            transaction.type.toLowerCase() == 'debit' ? '-' : '+',
                            style: GoogleFonts.inter(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: transaction.type.toLowerCase() == 'debit'
                                  ? Colors.red.shade400
                                  : Colors.green.shade400,
                            ),
                          ),
                          Text(
                            currencyFormat.format(transaction.amount),
                            style: GoogleFonts.inter(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              color: transaction.type.toLowerCase() == 'debit'
                                  ? Colors.red.shade400
                                  : Colors.green.shade400,
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Status Badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: _getStatusColor(transaction.status)
                                  .withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              transaction.status.toUpperCase(),
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _getStatusColor(transaction.status),
                              ),
                            ),
                          ),
                          const SizedBox(height: 32),

                          // Details Card
                          Card(
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  _DetailRow(
                                    label: 'Description',
                                    value: transaction.description,
                                    icon: Icons.description,
                                  ),
                                  const Divider(height: 32),
                                  _DetailRow(
                                    label: 'Transaction Type',
                                    value: transaction.type.toUpperCase(),
                                    icon: Icons.swap_vert,
                                    valueColor:
                                        transaction.type.toLowerCase() == 'debit'
                                            ? Colors.red.shade400
                                            : Colors.green.shade400,
                                  ),
                                  const Divider(height: 32),
                                  _DetailRow(
                                    label: 'Reference Number',
                                    value: transaction.referenceNumber,
                                    icon: Icons.tag,
                                    canCopy: true,
                                  ),
                                  const Divider(height: 32),
                                  _DetailRow(
                                    label: 'Date & Time',
                                    value: transaction.createdAt != null
                                        ? dateTimeFormat
                                            .format(transaction.createdAt!)
                                        : 'N/A',
                                    icon: Icons.access_time,
                                  ),
                                  if (transaction.metadata != null &&
                                      transaction.metadata!.isNotEmpty) ...[
                                    const Divider(height: 32),
                                    _DetailRow(
                                      label: 'Additional Info',
                                      value: transaction.metadata.toString(),
                                      icon: Icons.info_outline,
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Action Buttons
                          if (transaction.status.toLowerCase() == 'completed')
                            Column(
                              children: [
                                SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton.icon(
                                    onPressed: () => _downloadReceipt(transaction),
                                    icon: const Icon(Icons.download),
                                    label: const Text('Download Receipt'),
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton.icon(
                                    onPressed: () => _reportIssue(transaction),
                                    icon: const Icon(Icons.report_problem),
                                    label: const Text('Report an Issue'),
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Icons.check_circle;
      case 'pending':
        return Icons.hourglass_empty;
      case 'failed':
        return Icons.error;
      default:
        return Icons.help;
    }
  }

  void _shareTransaction(dynamic transaction) {
    // TODO: Implement share functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Share functionality coming soon')),
    );
  }

  void _downloadReceipt(dynamic transaction) {
    // TODO: Implement receipt download
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Receipt download coming soon')),
    );
  }

  void _reportIssue(dynamic transaction) {
    // TODO: Implement issue reporting
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Issue reporting coming soon')),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? valueColor;
  final bool canCopy;

  const _DetailRow({
    required this.label,
    required this.value,
    required this.icon,
    this.valueColor,
    this.canCopy = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 20, color: Colors.grey.shade400),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: Colors.grey.shade400,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      value,
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: valueColor,
                      ),
                    ),
                  ),
                  if (canCopy)
                    IconButton(
                      icon: Icon(
                        Icons.copy,
                        size: 18,
                        color: Colors.grey.shade400,
                      ),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: value));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Copied to clipboard')),
                        );
                      },
                    ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
