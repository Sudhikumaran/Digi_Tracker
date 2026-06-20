import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _darkModeKey = 'darkMode';

/// Simple bool provider — avoids hot-reload type mismatches from Notifier migrations.
final themeProvider = StateProvider<bool>((ref) => false);

Future<bool> loadSavedDarkMode() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool(_darkModeKey) ?? false;
}

Future<void> persistDarkMode(bool value) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool(_darkModeKey, value);
}

Future<void> setThemeDark(WidgetRef ref, bool value) async {
  ref.read(themeProvider.notifier).state = value;
  await persistDarkMode(value);
}

Future<void> toggleTheme(WidgetRef ref) async {
  final next = !ref.read(themeProvider);
  await setThemeDark(ref, next);
}
