import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../../services/api_service.dart';
import '../../../../shared/widgets/ui_components.dart';
import '../../../../core/config/theme/app_theme.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  Map<String, dynamic>? _dashboard;
  Map<String, dynamic>? _insights;
  List<dynamic> _chartData = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = ApiService();
    try {
      final dash = await api.getDashboard();
      final insights = await api.getInsights();
      final modules = await api.getModules();
      List<dynamic> chart = [];
      if (modules.isNotEmpty) {
        final mod = modules.first;
        final field = (mod['fields'] as List).firstWhere(
          (f) => f['type'] == 'number',
          orElse: () => mod['fields'][0],
        );
        final growth = await api.getGrowth(mod['_id'], field['slug']);
        chart = growth['data'] ?? [];
      }
      setState(() {
        _dashboard = dash;
        _insights = insights;
        _chartData = chart;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    if (!auth.isOwner) {
      return const Scaffold(body: Center(child: Text('Analytics available for business owners')));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  Row(
                    children: [
                      Expanded(child: _KpiTile('Modules', '${_dashboard?['totalModules'] ?? 0}')),
                      const SizedBox(width: 8),
                      Expanded(child: _KpiTile('Staff', '${_dashboard?['totalStaff'] ?? 0}')),
                      const SizedBox(width: 8),
                      Expanded(child: _KpiTile('Entries', '${_dashboard?['totalEntries'] ?? 0}')),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  if (_chartData.isNotEmpty) ...[
                    const SectionTitle(title: 'Growth Trend'),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 200,
                      child: LineChart(
                        LineChartData(
                          gridData: const FlGridData(show: false),
                          titlesData: const FlTitlesData(show: false),
                          borderData: FlBorderData(show: false),
                          lineBarsData: [
                            LineChartBarData(
                              spots: _chartData.asMap().entries.map((e) {
                                return FlSpot(e.key.toDouble(), (e.value['value'] as num).toDouble());
                              }).toList(),
                              isCurved: true,
                              color: AppColors.primary,
                              barWidth: 3,
                              dotData: const FlDotData(show: false),
                              belowBarData: BarAreaData(
                                show: true,
                                color: AppColors.primary.withValues(alpha: 0.1),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  if (_insights != null) ...[
                    const SectionTitle(title: 'Insights'),
                    _InsightCard(
                      title: 'Fastest Growing',
                      value: _insights!['fastestGrowingChannel']?['module'] ?? 'N/A',
                      subtitle: '+${_insights!['fastestGrowingChannel']?['growth'] ?? 0}%',
                      icon: Icons.rocket_launch,
                      color: AppColors.success,
                    ),
                    _InsightCard(
                      title: 'Consistency Score',
                      value: '${_insights!['consistencyScore'] ?? 0}%',
                      icon: Icons.verified,
                      color: AppColors.primary,
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}

class _KpiTile extends StatelessWidget {
  final String label;
  final String value;
  const _KpiTile(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.primary)),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}

class _InsightCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final IconData icon;
  final Color color;

  const _InsightCard({required this.title, required this.value, this.subtitle, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: AppCard(
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: color.withValues(alpha: 0.12),
            child: Icon(icon, color: color),
          ),
        title: Text(title, style: const TextStyle(fontSize: 13)),
        subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        trailing: subtitle != null ? Text(subtitle!, style: TextStyle(color: color, fontWeight: FontWeight.w600)) : null,
        ),
      ),
    );
  }
}
