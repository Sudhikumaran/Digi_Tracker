import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../../core/config/theme/app_theme.dart';
import '../../../../core/utils/api_error.dart';
import '../../../../services/api_service.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../shared/widgets/ui_components.dart';

class ProfileEditScreen extends ConsumerStatefulWidget {
  const ProfileEditScreen({super.key});

  @override
  ConsumerState<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends ConsumerState<ProfileEditScreen> {
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _phone = TextEditingController();
  bool _loading = false;
  bool _initialized = false;
  String? _error;

  void _initFromUser() {
    if (_initialized) return;
    final user = ref.read(authProvider).user;
    _firstName.text = user?['firstName']?.toString() ?? '';
    _lastName.text = user?['lastName']?.toString() ?? '';
    _phone.text = user?['phone']?.toString() ?? '';
    _initialized = true;
  }

  Future<void> _save() async {
    setState(() { _loading = true; _error = null; });
    try {
      await ApiService().updateProfile({
        'firstName': _firstName.text.trim(),
        'lastName': _lastName.text.trim(),
        'phone': _phone.text.trim(),
      });
      await ref.read(authProvider.notifier).refreshUser();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated'), backgroundColor: AppColors.success),
        );
        context.pop();
      }
    } catch (e) {
      setState(() => _error = parseApiError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _phone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    _initFromUser();
    final isDark = ref.watch(themeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          TextField(controller: _firstName, decoration: const InputDecoration(labelText: 'First Name')),
          const SizedBox(height: AppSpacing.md),
          TextField(controller: _lastName, decoration: const InputDecoration(labelText: 'Last Name')),
          const SizedBox(height: AppSpacing.md),
          TextField(controller: _phone, decoration: const InputDecoration(labelText: 'Phone')),
          const SizedBox(height: AppSpacing.lg),
          AppCard(
            child: SwitchListTile(
              title: const Text('Dark Mode', style: TextStyle(fontWeight: FontWeight.w600)),
              subtitle: const Text('Toggle app theme', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              value: isDark,
              onChanged: (v) => setThemeDark(ref, v),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(_error!, style: const TextStyle(color: AppColors.error)),
          ],
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: _loading ? null : _save,
              child: _loading
                  ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Save Changes'),
            ),
          ),
        ],
      ),
    );
  }
}
