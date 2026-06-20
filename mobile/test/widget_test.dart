import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:digitracker/app.dart';

void main() {
  testWidgets('App loads login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: DigiTrackerApp()));
    await tester.pumpAndSettle();

    expect(find.text('DigiTracker'), findsOneWidget);
    expect(find.text('Sign In'), findsOneWidget);
  });
}
