import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  factory DioClient() => _instance;

  late final Dio dio;
  final _storage = const FlutterSecureStorage();

  DioClient._internal() {
    dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshToken = await _storage.read(key: 'refreshToken');
          if (refreshToken != null) {
            try {
              final response = await Dio().post(
                '${AppConfig.apiBaseUrl}/auth/refresh',
                data: {'refreshToken': refreshToken},
              );
              final newToken = response.data['data']['accessToken'];
              final newRefresh = response.data['data']['refreshToken'];
              await _storage.write(key: 'accessToken', value: newToken);
              await _storage.write(key: 'refreshToken', value: newRefresh);
              error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              final retry = await dio.fetch(error.requestOptions);
              return handler.resolve(retry);
            } catch (_) {
              await _storage.deleteAll();
            }
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<void> saveTokens(String access, String refresh) async {
    await _storage.write(key: 'accessToken', value: access);
    await _storage.write(key: 'refreshToken', value: refresh);
  }

  Future<void> clearTokens() async {
    await _storage.deleteAll();
  }

  Future<bool> hasToken() async {
    return await _storage.read(key: 'accessToken') != null;
  }
}
