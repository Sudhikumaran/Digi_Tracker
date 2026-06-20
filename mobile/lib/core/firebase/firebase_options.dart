import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

/// Firebase client config for digi-tracker-8b0be
///
/// After adding Web/Android/iOS apps in Firebase Console, run:
///   flutterfire configure --project=digi-tracker-8b0be
/// That command replaces this file with real API keys.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return web;
    }
  }

  // Replace apiKey/appId/messagingSenderId after `flutterfire configure`
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'REPLACE_WITH_WEB_API_KEY',
    appId: 'REPLACE_WITH_WEB_APP_ID',
    messagingSenderId: '106229101911556181157',
    projectId: 'digi-tracker-8b0be',
    authDomain: 'digi-tracker-8b0be.firebaseapp.com',
    storageBucket: 'digi-tracker-8b0be.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'REPLACE_WITH_ANDROID_API_KEY',
    appId: 'REPLACE_WITH_ANDROID_APP_ID',
    messagingSenderId: '106229101911556181157',
    projectId: 'digi-tracker-8b0be',
    storageBucket: 'digi-tracker-8b0be.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'REPLACE_WITH_IOS_API_KEY',
    appId: 'REPLACE_WITH_IOS_APP_ID',
    messagingSenderId: '106229101911556181157',
    projectId: 'digi-tracker-8b0be',
    storageBucket: 'digi-tracker-8b0be.firebasestorage.app',
    iosBundleId: 'com.digitracker',
  );
}
