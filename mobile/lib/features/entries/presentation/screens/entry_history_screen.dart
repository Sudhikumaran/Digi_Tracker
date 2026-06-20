import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../services/api_service.dart';
import '../../../../shared/widgets/loading_skeleton.dart';
import '../../../../shared/widgets/ui_components.dart';
import '../../../../core/config/theme/app_theme.dart';

class EntryHistoryScreen extends StatefulWidget {
  const EntryHistoryScreen({super.key});

  @override
  State<EntryHistoryScreen> createState() => _EntryHistoryScreenState();
}

class _EntryHistoryScreenState extends State<EntryHistoryScreen> {
  List<dynamic> _entries = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final entries = await ApiService().getMyHistory();
    setState(() {
      _entries = entries;
      _loading = false;
    });
  }

  bool _isToday(String dateStr) {
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  void _openEntry(Map<String, dynamic> entry) {
    final moduleId = entry['moduleId']?['_id'] ?? entry['moduleId'];
    final entryId = entry['_id'];
    if (_isToday(entry['entryDate'])) {
      context.push('/entries/$moduleId?entryId=$entryId');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My History')),
      body: _loading
          ? ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.md),
              itemCount: 5,
              itemBuilder: (_, __) => const Padding(
                padding: EdgeInsets.only(bottom: AppSpacing.sm),
                child: LoadingSkeleton(height: 80),
              ),
            )
          : _entries.isEmpty
              ? const EmptyState(
                  icon: Icons.history_rounded,
                  title: 'No entries yet',
                  subtitle: 'Your submitted metrics will appear here',
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: _entries.length,
                    itemBuilder: (context, index) {
                      final entry = _entries[index];
                      final module = entry['moduleId'];
                      final date = DateTime.parse(entry['entryDate']);
                      final isToday = _isToday(entry['entryDate']);

                      return Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                        child: AppCard(
                          onTap: isToday ? () => _openEntry(entry) : null,
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  module?['name']?[0] ?? '?',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      module?['name'] ?? 'Unknown',
                                      style: const TextStyle(fontWeight: FontWeight.w600),
                                    ),
                                    Text(
                                      DateFormat('MMM d, yyyy').format(date),
                                      style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                                    ),
                                    if (isToday)
                                      const Text(
                                        'Tap to edit',
                                        style: TextStyle(color: AppColors.primary, fontSize: 11),
                                      ),
                                  ],
                                ),
                              ),
                              if (entry['isEdited'] == true)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.warning.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text(
                                    'Edited',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.warning),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
