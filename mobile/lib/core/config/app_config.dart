import 'package:flutter/foundation.dart';

class AppConfig {
  static const String appName = 'DigiTracker';

  static String get apiBaseUrl {
    if (kIsWeb) return 'http://localhost:5000/api/v1';
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:5000/api/v1';
      default:
        return 'http://localhost:5000/api/v1';
    }
  }

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
}
