import 'package:flutter/material.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';

import '../../../auth/presentation/providers/auth_provider.dart';

import '../../../../services/api_service.dart';

import '../../../../shared/widgets/module_logo.dart';

import '../../../../shared/widgets/loading_skeleton.dart';

import '../../../../shared/widgets/ui_components.dart';

import '../../../../core/config/theme/app_theme.dart';



class DashboardScreen extends ConsumerStatefulWidget {

  const DashboardScreen({super.key});



  @override

  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();

}



class _DashboardScreenState extends ConsumerState<DashboardScreen> {

  Map<String, dynamic>? _rewards;

  Map<String, dynamic>? _todayStatus;

  bool _loading = true;

  String? _error;



  @override

  void initState() {

    super.initState();

    _load();

  }



  Future<void> _load() async {

    setState(() => _error = null);

    final api = ApiService();

    try {

      final results = await Future.wait([

        api.getMyRewards(),

        api.getTodayStatus(),

      ]);

      setState(() {

        _rewards = results[0];

        _todayStatus = results[1];

        _loading = false;

      });

    } catch (_) {

      setState(() {

        _loading = false;

        _error = 'Failed to load dashboard. Pull to refresh.';

      });

    }

  }



  String _greeting() {

    final hour = DateTime.now().hour;

    if (hour < 12) return 'Good morning';

    if (hour < 17) return 'Good afternoon';

    return 'Good evening';

  }



  @override

  Widget build(BuildContext context) {

    final auth = ref.watch(authProvider);

    final firstName = auth.user?['firstName']?.toString() ?? 'User';

    final greetingText = '${_greeting()}, $firstName 👋';

    final modules = (_todayStatus?['modules'] as List?) ?? [];

    final completionRate = _todayStatus?['completionRate'] ?? 0;



    return Scaffold(

      body: RefreshIndicator(

        onRefresh: _load,

        edgeOffset: 120,

        child: CustomScrollView(

          slivers: [

            SliverToBoxAdapter(
              child: DecoratedBox(
                decoration: const BoxDecoration(gradient: AppGradients.primary),
                child: SafeArea(
                  bottom: false,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 12, 8, 16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                greetingText,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: -0.3,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _loading ? 'Loading today\'s progress...' : '$completionRate% complete today',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.notifications_outlined, size: 20, color: Colors.white),
                          ),
                          onPressed: () => context.push('/notifications'),
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

                  if (_error != null)

                    Padding(

                      padding: const EdgeInsets.only(bottom: AppSpacing.md),

                      child: Container(

                        padding: const EdgeInsets.all(12),

                        decoration: BoxDecoration(

                          color: AppColors.error.withValues(alpha: 0.08),

                          borderRadius: BorderRadius.circular(10),

                        ),

                        child: Row(

                          children: [

                            const Icon(Icons.error_outline, color: AppColors.error, size: 18),

                            const SizedBox(width: 8),

                            Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13))),

                          ],

                        ),

                      ),

                    ),

                  if (_loading)

                    const SizedBox(height: 100, child: KpiSkeletonGrid())

                  else ...[

                    SizedBox(

                      height: 120,

                      child: Row(

                        children: [

                          Expanded(

                            child: StatCard(

                              icon: Icons.local_fire_department_rounded,

                              label: 'Day Streak',

                              value: '${_rewards?['currentStreak'] ?? 0}',

                              gradient: AppGradients.warm,

                            ),

                          ),

                          const SizedBox(width: 12),

                          Expanded(

                            child: StatCard(

                              icon: Icons.stars_rounded,

                              label: 'Total Points',

                              value: '${_rewards?['totalPoints'] ?? 0}',

                              gradient: AppGradients.primary,

                            ),

                          ),

                        ],

                      ),

                    ),

                    if (modules.isNotEmpty) ...[

                      const SizedBox(height: AppSpacing.md),

                      ClipRRect(

                        borderRadius: BorderRadius.circular(8),

                        child: LinearProgressIndicator(

                          value: (completionRate as num) / 100,

                          minHeight: 6,

                          backgroundColor: AppColors.primary.withValues(alpha: 0.1),

                          color: AppColors.success,

                        ),

                      ),

                    ],

                    const SizedBox(height: AppSpacing.lg),

                    SectionTitle(

                      title: 'Today\'s Modules',

                      action: 'See all',

                      onAction: () => context.push('/entries'),

                    ),

                    const SizedBox(height: AppSpacing.sm),

                    if (modules.isEmpty)

                      const EmptyState(

                        icon: Icons.dashboard_outlined,

                        title: 'No modules yet',

                        subtitle: 'Modules will appear here once configured',

                      )

                    else

                      ...modules.map((mod) {

                        final submitted = mod['submitted'] == true;

                        final moduleId = mod['moduleId']?.toString() ?? mod['moduleId'];

                        final entryId = mod['entryId']?.toString();



                        return Padding(

                          padding: const EdgeInsets.only(bottom: AppSpacing.sm),

                          child: AppCard(

                            onTap: () {

                              if (submitted && entryId != null) {

                                context.push('/entries/$moduleId?entryId=$entryId');

                              } else {

                                context.push('/entries/$moduleId');

                              }

                            },

                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),

                            child: Row(

                              children: [

                                ModuleLogo(

                                  slug: mod['slug'],

                                  iconName: mod['icon'],

                                  hexColor: mod['color'],

                                  size: 44,

                                ),

                                const SizedBox(width: 14),

                                Expanded(

                                  child: Column(

                                    crossAxisAlignment: CrossAxisAlignment.start,

                                    children: [

                                      Text(

                                        mod['name'],

                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),

                                      ),

                                      Text(

                                        submitted ? 'Submitted — tap to edit' : 'Pending submission',

                                        style: TextStyle(

                                          color: submitted ? AppColors.success : AppColors.textMuted,

                                          fontSize: 12,

                                        ),

                                      ),

                                    ],

                                  ),

                                ),

                                Container(

                                  padding: const EdgeInsets.all(6),

                                  decoration: BoxDecoration(

                                    color: submitted

                                        ? AppColors.success.withValues(alpha: 0.12)

                                        : AppColors.warning.withValues(alpha: 0.12),

                                    borderRadius: BorderRadius.circular(8),

                                  ),

                                  child: Icon(

                                    submitted ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,

                                    size: 20,

                                    color: submitted ? AppColors.success : AppColors.warning,

                                  ),

                                ),

                              ],

                            ),

                          ),

                        );

                      }),

                    const SizedBox(height: AppSpacing.lg),

                    SizedBox(

                      height: 52,

                      child: ElevatedButton.icon(

                        onPressed: () => context.push('/entries'),

                        icon: const Icon(Icons.add_rounded),

                        label: const Text('New Entry'),

                      ),

                    ),

                    if (auth.isOwner) ...[

                      const SizedBox(height: AppSpacing.sm),

                      SizedBox(

                        height: 52,

                        child: OutlinedButton.icon(

                          onPressed: () => context.push('/analytics'),

                          icon: const Icon(Icons.bar_chart_rounded),

                          label: const Text('View Analytics'),

                        ),

                      ),

                    ],

                    const SizedBox(height: AppSpacing.xl),

                  ],

                ]),

              ),

            ),

          ],

        ),

      ),

    );

  }

}

