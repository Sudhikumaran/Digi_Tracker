import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/config/theme/app_theme.dart';
import '../../../../core/utils/api_error.dart';
import '../../../../services/api_service.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String? token;

  const ResetPasswordScreen({super.key, this.token});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    if (_passwordController.text != _confirmController.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    if (_passwordController.text.length < 8) {
      setState(() => _error = 'Password must be at least 8 characters');
      return;
    }

    setState(() { _loading = true; _error = null; });
    try {
      await ApiService().resetPassword(widget.token ?? '', _passwordController.text);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password reset successful!'), backgroundColor: AppColors.success),
        );
        context.go('/login');
      }
    } catch (e) {
      setState(() => _error = parseApiError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset Password')),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'New Password', prefixIcon: Icon(Icons.lock_outline)),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _confirmController,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Confirm Password', prefixIcon: Icon(Icons.lock_outline)),
            ),
            if (_error != null) ...[
              const SizedBox(height: AppSpacing.md),
              Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
            ],
            const SizedBox(height: AppSpacing.lg),
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Reset Password'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
