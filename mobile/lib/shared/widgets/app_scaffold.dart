import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/theme/app_theme.dart';

class AppScaffold extends StatelessWidget {
  final Widget child;

  const AppScaffold({super.key, required this.child});

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location == '/') return 0;
    if (location.startsWith('/entries') || location == '/history') return 1;
    if (location == '/rewards') return 2;
    if (location == '/profile') return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceDarkCard : AppColors.surfaceCard,
          border: Border(
            top: BorderSide(color: isDark ? AppColors.borderDark : AppColors.border),
          ),
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 20,
                    offset: const Offset(0, -4),
                  ),
                ],
        ),
        child: SafeArea(
          child: NavigationBar(
            selectedIndex: _currentIndex(context),
            onDestinationSelected: (index) {
              switch (index) {
                case 0:
                  context.go('/');
                case 1:
                  context.go('/entries');
                case 2:
                  context.go('/rewards');
                case 3:
                  context.go('/profile');
              }
            },
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home_rounded),
                label: 'Home',
              ),
              NavigationDestination(
                icon: Icon(Icons.edit_note_outlined),
                selectedIcon: Icon(Icons.edit_note_rounded),
                label: 'Entry',
              ),
              NavigationDestination(
                icon: Icon(Icons.emoji_events_outlined),
                selectedIcon: Icon(Icons.emoji_events_rounded),
                label: 'Rewards',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outline_rounded),
                selectedIcon: Icon(Icons.person_rounded),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
