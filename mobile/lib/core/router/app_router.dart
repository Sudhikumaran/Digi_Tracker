import 'package:go_router/go_router.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';

import '../../features/auth/presentation/screens/login_screen.dart';

import '../../features/auth/presentation/screens/forgot_password_screen.dart';

import '../../features/auth/presentation/screens/reset_password_screen.dart';

import '../../features/dashboard/presentation/screens/dashboard_screen.dart';

import '../../features/entries/presentation/screens/module_select_screen.dart';

import '../../features/entries/presentation/screens/entry_form_screen.dart';

import '../../features/entries/presentation/screens/entry_history_screen.dart';

import '../../features/entries/presentation/screens/entry_success_screen.dart';

import '../../features/rewards/presentation/screens/rewards_screen.dart';

import '../../features/profile/presentation/screens/profile_screen.dart';

import '../../features/profile/presentation/screens/profile_edit_screen.dart';

import '../../features/analytics/presentation/screens/analytics_screen.dart';

import '../../features/notifications/presentation/screens/notifications_screen.dart';

import '../../shared/widgets/app_scaffold.dart';



final routerProvider = Provider<GoRouter>((ref) {

  final authState = ref.watch(authProvider);



  return GoRouter(

    initialLocation: '/',

    redirect: (context, state) {

      final isLoggedIn = authState.isAuthenticated;

      final isAuthRoute = state.matchedLocation == '/login'

          || state.matchedLocation == '/forgot-password'

          || state.matchedLocation.startsWith('/reset-password');



      if (!isLoggedIn && !isAuthRoute) return '/login';

      if (isLoggedIn && state.matchedLocation == '/login') return '/';

      return null;

    },

    routes: [

      GoRoute(

        path: '/login',

        builder: (context, state) => const LoginScreen(),

      ),

      GoRoute(

        path: '/forgot-password',

        builder: (context, state) => const ForgotPasswordScreen(),

      ),

      GoRoute(

        path: '/reset-password',

        builder: (context, state) => ResetPasswordScreen(

          token: state.uri.queryParameters['token'],

        ),

      ),

      GoRoute(

        path: '/entry-success',

        builder: (context, state) => EntrySuccessScreen(

          moduleName: state.uri.queryParameters['module'] ?? 'Module',

          isEdit: state.uri.queryParameters['edit'] == 'true',

        ),

      ),

      ShellRoute(

        builder: (context, state, child) => AppScaffold(child: child),

        routes: [

          GoRoute(path: '/', builder: (context, state) => const DashboardScreen()),

          GoRoute(path: '/entries', builder: (context, state) => const ModuleSelectScreen()),

          GoRoute(

            path: '/entries/:moduleId',

            builder: (context, state) => EntryFormScreen(

              moduleId: state.pathParameters['moduleId']!,

              entryId: state.uri.queryParameters['entryId'],

            ),

          ),

          GoRoute(path: '/history', builder: (context, state) => const EntryHistoryScreen()),

          GoRoute(path: '/rewards', builder: (context, state) => const RewardsScreen()),

          GoRoute(path: '/analytics', builder: (context, state) => const AnalyticsScreen()),

          GoRoute(path: '/notifications', builder: (context, state) => const NotificationsScreen()),

          GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),

          GoRoute(path: '/profile/edit', builder: (context, state) => const ProfileEditScreen()),

        ],

      ),

    ],

  );

});

