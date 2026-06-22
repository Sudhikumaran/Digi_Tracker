import 'package:flutter/foundation.dart';

class AppConfig {
  static const String appName = 'DigiTracker';

  /// Override at build time:
  /// flutter build apk --dart-define=API_BASE_URL=https://your-api.up.railway.app/api/v1
  static const String apiBaseUrlOverride = String.fromEnvironment('API_BASE_URL');

  static const String productionApiBaseUrl =
      'https://digitracker-production.up.railway.app/api/v1';

  static String get apiBaseUrl {
    if (apiBaseUrlOverride.isNotEmpty) {
      return apiBaseUrlOverride;
    }

    // Release and profile builds always use production.
    if (!kDebugMode) {
      return productionApiBaseUrl;
    }

    // Local development against a machine-hosted API.
    if (kIsWeb) {
      return 'http://localhost:5000/api/v1';
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:5000/api/v1';
      default:
        return 'http://localhost:5000/api/v1';
    }
  }

  static bool get usesProductionApi => apiBaseUrl == productionApiBaseUrl;

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
}
