import 'package:flutter/material.dart';
import '../../../../services/api_service.dart';
import '../../../../core/config/theme/app_theme.dart';
import '../../../../shared/widgets/loading_skeleton.dart';
import '../../../../shared/widgets/ui_components.dart';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({super.key});

  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  Map<String, dynamic>? _rewards;
  List<dynamic> _leaderboard = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final rewards = await ApiService().getMyRewards();
    final leaderboardData = await ApiService().getLeaderboard();
    setState(() {
      _rewards = rewards;
      _leaderboard = leaderboardData['leaderboard'] ?? [];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loading
          ? const Padding(padding: EdgeInsets.all(AppSpacing.md), child: LoadingSkeleton(height: 200))
          : RefreshIndicator(
              onRefresh: _load,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: DecoratedBox(
                      decoration: const BoxDecoration(gradient: AppGradients.rewards),
                      child: SafeArea(
                        bottom: false,
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${_rewards?['totalPoints'] ?? 0}',
                                style: const TextStyle(
                                  fontSize: 42,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  height: 1,
                                ),
                              ),
                              Text(
                                'Total Points',
                                style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 14),
                              ),
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 10,
                                runSpacing: 8,
                                children: [
                                  _HeroChip(
                                    icon: Icons.local_fire_department_rounded,
                                    label: 'Streak',
                                    value: '${_rewards?['currentStreak'] ?? 0}',
                                  ),
                                  _HeroChip(
                                    icon: Icons.emoji_events_outlined,
                                    label: 'Best',
                                    value: '${_rewards?['longestStreak'] ?? 0}',
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        const SectionTitle(title: 'Leaderboard'),
                        const SizedBox(height: AppSpacing.sm),
                        if (_leaderboard.isEmpty)
                          const EmptyState(
                            icon: Icons.leaderboard_outlined,
                            title: 'No rankings yet',
                            subtitle: 'Submit entries to climb the board',
                          )
                        else
                          ..._leaderboard.asMap().entries.map((entry) {
                            final item = entry.value;
                            final rank = item['rank'] as int? ?? entry.key + 1;
                            return Padding(
                              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                              child: AppCard(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                child: Row(
                                  children: [
                                    _RankBadge(rank: rank),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item['name'] ?? '',
                                            style: const TextStyle(fontWeight: FontWeight.w600),
                                          ),
                                          Text(
                                            '🔥 ${item['streak']} day streak',
                                            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      '${item['points']} pts',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

class _HeroChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _HeroChip({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
              Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}

class _RankBadge extends StatelessWidget {
  final int rank;

  const _RankBadge({required this.rank});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    if (rank == 1) {
      bg = const Color(0xFFFEF3C7);
      fg = const Color(0xFFD97706);
    } else if (rank == 2) {
      bg = const Color(0xFFF1F5F9);
      fg = const Color(0xFF64748B);
    } else if (rank == 3) {
      bg = const Color(0xFFFFEDD5);
      fg = const Color(0xFFEA580C);
    } else {
      bg = AppColors.primary.withValues(alpha: 0.08);
      fg = AppColors.primary;
    }

    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Text('#$rank', style: TextStyle(fontWeight: FontWeight.w800, color: fg, fontSize: 13)),
    );
  }
}
