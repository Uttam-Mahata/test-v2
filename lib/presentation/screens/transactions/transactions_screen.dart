import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../providers/transaction_provider.dart';
import 'transaction_details_screen.dart';

class TransactionsScreen extends ConsumerStatefulWidget {
  const TransactionsScreen({super.key});

  @override
  ConsumerState<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends ConsumerState<TransactionsScreen> {
  String? _selectedFilter;
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  void initState() {
    super.initState();
    // Load all transactions when screen opens
    Future.microtask(() => ref.read(transactionProvider.notifier).loadTransactions());
  }

  @override
  Widget build(BuildContext context) {
    final transactionState = ref.watch(transactionProvider);
    final transactions = transactionState.transactions;
    final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    final dateFormat = DateFormat('MMM dd, yyyy');
    final timeFormat = DateFormat('h:mm a');

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Transactions',
          style: GoogleFonts.inter(fontWeight: FontWeight.w600),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Active Filters Chips
          if (_selectedFilter != null || _startDate != null || _endDate != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    if (_selectedFilter != null)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Chip(
                          label: Text(_selectedFilter!.toUpperCase()),
                          onDeleted: () {
                            setState(() => _selectedFilter = null);
                            _applyFilters();
                          },
                          backgroundColor: Colors.blue.withOpacity(0.1),
                          deleteIcon: const Icon(Icons.close, size: 16),
                        ),
                      ),
                    if (_startDate != null)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Chip(
                          label: Text('From: ${dateFormat.format(_startDate!)}'),
                          onDeleted: () {
                            setState(() => _startDate = null);
                            _applyFilters();
                          },
                          backgroundColor: Colors.green.withOpacity(0.1),
                          deleteIcon: const Icon(Icons.close, size: 16),
                        ),
                      ),
                    if (_endDate != null)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Chip(
                          label: Text('To: ${dateFormat.format(_endDate!)}'),
                          onDeleted: () {
                            setState(() => _endDate = null);
                            _applyFilters();
                          },
                          backgroundColor: Colors.orange.withOpacity(0.1),
                          deleteIcon: const Icon(Icons.close, size: 16),
                        ),
                      ),
                    TextButton.icon(
                      icon: const Icon(Icons.clear_all, size: 16),
                      label: const Text('Clear All'),
                      onPressed: () {
                        setState(() {
                          _selectedFilter = null;
                          _startDate = null;
                          _endDate = null;
                        });
                        ref.read(transactionProvider.notifier).clearFilters();
                      },
                    ),
                  ],
                ),
              ),
            ),

          // Transactions List
          Expanded(
            child: transactionState.isLoading && transactions.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : transactionState.error != null
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
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: () {
                                ref.read(transactionProvider.notifier).loadTransactions();
                              },
                              icon: const Icon(Icons.refresh),
                              label: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () async {
                          await _applyFilters();
                        },
                        child: transactions.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.receipt_long_outlined,
                                      size: 80,
                                      color: Colors.grey.shade600,
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'No transactions found',
                                      style: GoogleFonts.inter(
                                        fontSize: 18,
                                        color: Colors.grey.shade400,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: transactions.length,
                                itemBuilder: (context, index) {
                                  final transaction = transactions[index];
                                  final isDebit = transaction.type.toLowerCase() == 'debit';
                                  final transactionDate =
                                      transaction.createdAt ?? DateTime.now();

                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: InkWell(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) =>
                                                TransactionDetailsScreen(
                                              transactionId: transaction.id,
                                            ),
                                          ),
                                        );
                                      },
                                      borderRadius: BorderRadius.circular(12),
                                      child: Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(10),
                                              decoration: BoxDecoration(
                                                color: isDebit
                                                    ? Colors.red.withOpacity(0.1)
                                                    : Colors.green.withOpacity(0.1),
                                                borderRadius: BorderRadius.circular(10),
                                              ),
                                              child: Icon(
                                                isDebit
                                                    ? Icons.arrow_upward
                                                    : Icons.arrow_downward,
                                                color: isDebit
                                                    ? Colors.red.shade400
                                                    : Colors.green.shade400,
                                                size: 20,
                                              ),
                                            ),
                                            const SizedBox(width: 16),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    transaction.description,
                                                    style: GoogleFonts.inter(
                                                      fontSize: 14,
                                                      fontWeight: FontWeight.w600,
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Row(
                                                    children: [
                                                      Text(
                                                        dateFormat.format(transactionDate),
                                                        style: GoogleFonts.inter(
                                                          fontSize: 12,
                                                          color: Colors.grey.shade400,
                                                        ),
                                                      ),
                                                      Text(
                                                        ' • ',
                                                        style: GoogleFonts.inter(
                                                          color: Colors.grey.shade400,
                                                        ),
                                                      ),
                                                      Text(
                                                        timeFormat.format(transactionDate),
                                                        style: GoogleFonts.inter(
                                                          fontSize: 12,
                                                          color: Colors.grey.shade400,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    'Ref: ${transaction.referenceNumber}',
                                                    style: GoogleFonts.inter(
                                                      fontSize: 10,
                                                      color: Colors.grey.shade500,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.end,
                                              children: [
                                                Text(
                                                  '${isDebit ? '-' : '+'}${currencyFormat.format(transaction.amount)}',
                                                  style: GoogleFonts.inter(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.bold,
                                                    color: isDebit
                                                        ? Colors.red.shade400
                                                        : Colors.green.shade400,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 4,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    color: _getStatusColor(transaction.status)
                                                        .withOpacity(0.1),
                                                    borderRadius: BorderRadius.circular(6),
                                                  ),
                                                  child: Text(
                                                    transaction.status.toUpperCase(),
                                                    style: GoogleFonts.inter(
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.w600,
                                                      color: _getStatusColor(
                                                          transaction.status),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Filter Transactions',
                    style: GoogleFonts.inter(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Transaction Type Filter
                  Text(
                    'Transaction Type',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: [
                      ChoiceChip(
                        label: const Text('All'),
                        selected: _selectedFilter == null,
                        onSelected: (selected) {
                          setModalState(() => _selectedFilter = null);
                          setState(() => _selectedFilter = null);
                        },
                      ),
                      ChoiceChip(
                        label: const Text('Credit'),
                        selected: _selectedFilter == 'credit',
                        onSelected: (selected) {
                          setModalState(() => _selectedFilter = 'credit');
                          setState(() => _selectedFilter = 'credit');
                        },
                      ),
                      ChoiceChip(
                        label: const Text('Debit'),
                        selected: _selectedFilter == 'debit',
                        onSelected: (selected) {
                          setModalState(() => _selectedFilter = 'debit');
                          setState(() => _selectedFilter = 'debit');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Date Range Filter
                  Text(
                    'Date Range',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.calendar_today, size: 16),
                          label: Text(
                            _startDate != null
                                ? DateFormat('MMM dd').format(_startDate!)
                                : 'Start Date',
                          ),
                          onPressed: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _startDate ?? DateTime.now(),
                              firstDate: DateTime(2020),
                              lastDate: DateTime.now(),
                            );
                            if (date != null) {
                              setModalState(() => _startDate = date);
                              setState(() => _startDate = date);
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.calendar_today, size: 16),
                          label: Text(
                            _endDate != null
                                ? DateFormat('MMM dd').format(_endDate!)
                                : 'End Date',
                          ),
                          onPressed: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _endDate ?? DateTime.now(),
                              firstDate: _startDate ?? DateTime(2020),
                              lastDate: DateTime.now(),
                            );
                            if (date != null) {
                              setModalState(() => _endDate = date);
                              setState(() => _endDate = date);
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Apply Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _applyFilters();
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Apply Filters'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _applyFilters() async {
    await ref.read(transactionProvider.notifier).loadTransactions(
          type: _selectedFilter,
          startDate: _startDate,
          endDate: _endDate,
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
}
