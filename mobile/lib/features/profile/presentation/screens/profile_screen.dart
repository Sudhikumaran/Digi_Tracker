import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../../core/config/theme/app_theme.dart';
import '../../../../shared/widgets/ui_components.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth.user;
    final initials = '${user?['firstName']?[0] ?? ''}${user?['lastName']?[0] ?? ''}'.toUpperCase();
    final role = (user?['role'] ?? '').toString().replaceAll('_', ' ');

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: DecoratedBox(
              decoration: const BoxDecoration(gradient: AppGradients.cool),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.2),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 2),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          initials,
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?['email'] ?? '',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          role.toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                        ),
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
                _ProfileMenuItem(
                  icon: Icons.person_outline_rounded,
                  title: 'Edit Profile',
                  subtitle: 'Update name, phone & theme',
                  onTap: () => context.push('/profile/edit'),
                ),
                _ProfileMenuItem(
                  icon: Icons.history_rounded,
                  title: 'My Entry History',
                  subtitle: 'View past submissions',
                  onTap: () => context.push('/history'),
                ),
                if (auth.isOwner)
                  _ProfileMenuItem(
                    icon: Icons.bar_chart_rounded,
                    title: 'Analytics',
                    subtitle: 'Growth trends & insights',
                    onTap: () => context.push('/analytics'),
                  ),
                _ProfileMenuItem(
                  icon: Icons.notifications_outlined,
                  title: 'Notifications',
                  subtitle: 'Reminders & achievements',
                  onTap: () => context.push('/notifications'),
                ),
                const SizedBox(height: AppSpacing.md),
                _ProfileMenuItem(
                  icon: Icons.logout_rounded,
                  title: 'Logout',
                  subtitle: 'Sign out of your account',
                  isDestructive: true,
                  onTap: () async {
                    await ref.read(authProvider.notifier).logout();
                    if (context.mounted) context.go('/login');
                  },
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool isDestructive;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.isDestructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? AppColors.error : AppColors.primary;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: isDestructive ? AppColors.error : null,
                    ),
                  ),
                  Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: AppColors.textMuted.withValues(alpha: 0.6)),
          ],
        ),
      ),
    );
  }
}
