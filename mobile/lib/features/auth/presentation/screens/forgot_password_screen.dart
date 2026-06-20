import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/config/theme/app_theme.dart';
import '../../../../core/utils/api_error.dart';
import '../../../../services/api_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _loading = false;
  bool _sent = false;
  String? _error;

  Future<void> _submit() async {
    setState(() { _loading = true; _error = null; });
    try {
      await ApiService().forgotPassword(_emailController.text.trim());
      setState(() => _sent = true);
    } catch (e) {
      setState(() => _error = parseApiError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forgot Password')),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: _sent
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.mark_email_read_outlined, size: 64, color: AppColors.success),
                  const SizedBox(height: AppSpacing.md),
                  const Text('Check your email', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'If an account exists for ${_emailController.text}, a reset link has been sent.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.textMuted),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton(onPressed: () => context.go('/login'), child: const Text('Back to Login')),
                  ),
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Enter your email address and we\'ll send you a link to reset your password.',
                    style: TextStyle(color: AppColors.textMuted),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Email address',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
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
                          : const Text('Send Reset Link'),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
