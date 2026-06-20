import 'package:flutter/material.dart';
import '../../../../services/api_service.dart';
import '../../../../shared/widgets/ui_components.dart';
import '../../../../core/config/theme/app_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiService().getNotifications();
      setState(() {
        _notifications = data['notifications'] ?? [];
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _markRead(String id) async {
    await ApiService().markNotificationRead(id);
    _load();
  }

  Future<void> _markAllRead() async {
    await ApiService().markAllNotificationsRead();
    _load();
  }

  IconData _iconForType(String? type) {
    switch (type) {
      case 'entry_reminder':
        return Icons.alarm_rounded;
      case 'reward_achievement':
        return Icons.emoji_events_rounded;
      case 'weekly_analytics':
        return Icons.bar_chart_rounded;
      case 'monthly_report':
        return Icons.description_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _colorForType(String? type) {
    switch (type) {
      case 'entry_reminder':
        return AppColors.warning;
      case 'reward_achievement':
        return AppColors.secondary;
      case 'weekly_analytics':
        return AppColors.primary;
      default:
        return AppColors.accent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => n['isRead'] != true).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (unreadCount > 0)
            TextButton(onPressed: _markAllRead, child: const Text('Mark all read')),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const EmptyState(
                  icon: Icons.notifications_none_rounded,
                  title: 'All caught up',
                  subtitle: 'No notifications right now',
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final n = _notifications[index];
                      final isRead = n['isRead'] == true;
                      final color = _colorForType(n['type']);

                      return Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                        child: AppCard(
                          onTap: !isRead ? () => _markRead(n['_id']) : null,
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: isRead ? 0.06 : 0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(_iconForType(n['type']), color: color, size: 20),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      n['title'] ?? '',
                                      style: TextStyle(
                                        fontWeight: isRead ? FontWeight.w500 : FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      n['body'] ?? '',
                                      style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                              if (!isRead)
                                Container(
                                  width: 8,
                                  height: 8,
                                  margin: const EdgeInsets.only(top: 6),
                                  decoration: const BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
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
