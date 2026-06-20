import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/config/theme/app_theme.dart';

class EntrySuccessScreen extends StatelessWidget {
  final String moduleName;
  final bool isEdit;

  const EntrySuccessScreen({super.key, required this.moduleName, this.isEdit = false});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, size: 56, color: AppColors.success),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                isEdit ? 'Entry Updated!' : 'Entry Submitted!',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                isEdit
                    ? 'Your $moduleName entry has been updated successfully.'
                    : 'Your $moduleName metrics are saved. +10 points earned!',
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 15),
              ),
              const SizedBox(height: AppSpacing.xl),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () => context.go('/'),
                  child: const Text('Back to Dashboard'),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  onPressed: () => context.push('/history'),
                  child: const Text('View History'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
