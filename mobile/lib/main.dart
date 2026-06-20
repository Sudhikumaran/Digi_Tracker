import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'shared/providers/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final savedDark = await loadSavedDarkMode();
  runApp(
    ProviderScope(
      overrides: [
        themeProvider.overrideWith((ref) => savedDark),
      ],
      child: const DigiTrackerApp(),
    ),
  );
}
