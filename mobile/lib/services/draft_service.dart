import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class DraftService {
  static const _prefix = 'entry_draft_';

  Future<void> saveDraft(String moduleId, Map<String, dynamic> draft) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_prefix$moduleId', jsonEncode(draft));
  }

  Future<Map<String, dynamic>?> loadDraft(String moduleId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('$_prefix$moduleId');
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  Future<void> clearDraft(String moduleId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_prefix$moduleId');
  }
}
