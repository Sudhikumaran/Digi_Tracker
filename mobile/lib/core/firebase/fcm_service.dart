import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../../services/api_service.dart';
import 'firebase_options.dart';

/// Handles FCM token registration with the DigiTracker API.
class FcmService {
  static bool _initialized = false;

  static Future<void> initialize() async {
    if (_initialized) return;

    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
      }

      if (kIsWeb) {
        // Web push requires VAPID key from Firebase Console → Cloud Messaging
        final messaging = FirebaseMessaging.instance;
        await messaging.requestPermission();
      } else {
        await FirebaseMessaging.instance.requestPermission();
      }

      _initialized = true;
    } catch (e) {
      debugPrint('[FCM] Firebase not configured yet: $e');
      debugPrint('[FCM] Run: flutterfire configure --project=digi-tracker-8b0be');
    }
  }

  static Future<void> registerTokenWithBackend() async {
    if (!_initialized) return;

    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) return;
      await ApiService().registerFcmToken(token);
      debugPrint('[FCM] Token registered with backend');
    } catch (e) {
      debugPrint('[FCM] Token registration failed: $e');
    }
  }
}
