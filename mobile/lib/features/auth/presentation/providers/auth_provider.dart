import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../services/api_service.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/firebase/fcm_service.dart';

class AuthState {
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? business;
  final bool isLoading;
  final bool isAuthenticated;
  final String? error;

  const AuthState({
    this.user,
    this.business,
    this.isLoading = false,
    this.isAuthenticated = false,
    this.error,
  });

  AuthState copyWith({
    Map<String, dynamic>? user,
    Map<String, dynamic>? business,
    bool? isLoading,
    bool? isAuthenticated,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      business: business ?? this.business,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      error: error,
    );
  }

  bool get isOwner => user?['role'] == 'business_owner';
  bool get isStaff => user?['role'] == 'staff';
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _api = ApiService();

  AuthNotifier() : super(const AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    if (await DioClient().hasToken()) {
      try {
        final user = await _api.getMe();
        state = AuthState(user: user, isAuthenticated: true);
        await FcmService.initialize();
        await FcmService.registerTokenWithBackend();
      } catch (_) {
        await DioClient().clearTokens();
      }
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _api.login(email, password);
      await DioClient().saveTokens(data['accessToken'], data['refreshToken']);
      state = AuthState(
        user: data['user'],
        business: data['business'],
        isAuthenticated: true,
      );
      await FcmService.initialize();
      await FcmService.registerTokenWithBackend();
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e is DioException
            ? e.response?.data['message'] ?? 'Login failed'
            : 'Login failed',
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _api.logout();
    state = const AuthState();
  }

  Future<void> refreshUser() async {
    final user = await _api.getMe();
    state = state.copyWith(user: user);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());
