# Flutter Application Structure

## Architecture: Clean Architecture + Feature-First

```
mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart
│   │   │   └── theme/
│   │   │       ├── app_theme.dart
│   │   │       ├── app_colors.dart
│   │   │       └── app_typography.dart
│   │   ├── constants/
│   │   │   ├── api_constants.dart
│   │   │   └── app_constants.dart
│   │   ├── errors/
│   │   │   ├── exceptions.dart
│   │   │   └── failures.dart
│   │   ├── network/
│   │   │   ├── dio_client.dart
│   │   │   └── interceptors/
│   │   │       ├── auth_interceptor.dart
│   │   │       └── error_interceptor.dart
│   │   ├── router/
│   │   │   ├── app_router.dart
│   │   │   └── route_names.dart
│   │   └── utils/
│   │       ├── date_utils.dart
│   │       └── validators.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── datasources/auth_remote_datasource.dart
│   │   │   │   ├── models/user_model.dart
│   │   │   │   └── repositories/auth_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/user_entity.dart
│   │   │   │   ├── repositories/auth_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── login_usecase.dart
│   │   │   │       └── logout_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── providers/auth_provider.dart
│   │   │       ├── screens/
│   │   │       │   ├── login_screen.dart
│   │   │       │   ├── forgot_password_screen.dart
│   │   │       │   └── reset_password_screen.dart
│   │   │       └── widgets/
│   │   ├── dashboard/
│   │   │   ├── data/ ...
│   │   │   ├── domain/ ...
│   │   │   └── presentation/
│   │   │       ├── screens/dashboard_screen.dart
│   │   │       └── widgets/kpi_card.dart
│   │   ├── entries/
│   │   │   ├── data/ ...
│   │   │   ├── domain/ ...
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       │   ├── entry_form_screen.dart
│   │   │       │   ├── module_select_screen.dart
│   │   │       │   └── entry_history_screen.dart
│   │   │       └── widgets/field_input_widget.dart
│   │   ├── analytics/
│   │   │   └── presentation/
│   │   │       ├── screens/analytics_screen.dart
│   │   │       └── widgets/growth_chart.dart
│   │   ├── rewards/
│   │   │   └── presentation/
│   │   │       ├── screens/rewards_screen.dart
│   │   │       └── widgets/leaderboard_tile.dart
│   │   ├── notifications/
│   │   │   └── presentation/
│   │   │       └── screens/notifications_screen.dart
│   │   └── profile/
│   │       └── presentation/
│   │           └── screens/profile_screen.dart
│   └── shared/
│       ├── providers/
│       │   └── theme_provider.dart
│       └── widgets/
│           ├── app_scaffold.dart
│           ├── loading_skeleton.dart
│           ├── empty_state.dart
│           └── error_widget.dart
├── pubspec.yaml
└── analysis_options.yaml
```

## State Management: Riverpod

| Provider Type | Usage |
|---------------|-------|
| `Provider` | Repositories, services |
| `StateNotifierProvider` | Auth state, form state |
| `FutureProvider` | API data fetching |
| `StreamProvider` | Real-time notifications |

## Navigation: GoRouter

```dart
// Route structure
/login
/forgot-password
/reset-password
/                          → Dashboard (shell with bottom nav)
/entries                   → Module selection
/entries/:moduleId         → Entry form
/entries/history           → My history
/analytics                 → Analytics (owner only)
/rewards                   → Rewards & leaderboard
/notifications             → Notifications
/profile                   → Profile settings
```

## Key Packages

| Package | Purpose |
|---------|---------|
| `flutter_riverpod` | State management |
| `go_router` | Navigation |
| `dio` | HTTP client |
| `freezed` + `json_serializable` | Immutable models |
| `fl_chart` | Charts |
| `firebase_messaging` | Push notifications |
| `flutter_secure_storage` | Token storage |
| `intl` | Date/number formatting |
| `cached_network_image` | Image caching |

## Data Flow

```
Screen → Provider → UseCase → Repository → DataSource → API
  ↑                                                        ↓
  └────────────── Entity ← Model ← JSON Response ──────────┘
```

## Theme System

Material 3 with custom color scheme:
- Light/Dark mode toggle via `ThemeProvider`
- Business branding colors applied dynamically
- Consistent spacing: 4, 8, 12, 16, 24, 32
