import '../../core/network/dio_client.dart';



class ApiService {

  final _dio = DioClient().dio;



  // Auth

  Future<Map<String, dynamic>> login(String email, String password) async {

    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});

    return res.data['data'];

  }



  Future<void> logout() async {

    final refresh = await DioClient().dio.options.headers['refreshToken'];

    try {

      await _dio.post('/auth/logout', data: {'refreshToken': refresh});

    } catch (_) {}

    await DioClient().clearTokens();

  }



  Future<Map<String, dynamic>> forgotPassword(String email) async {

    final res = await _dio.post('/auth/forgot-password', data: {'email': email});

    return res.data;

  }



  Future<Map<String, dynamic>> resetPassword(String token, String password) async {

    final res = await _dio.post('/auth/reset-password', data: {'token': token, 'password': password});

    return res.data;

  }



  // Users

  Future<Map<String, dynamic>> getMe() async {

    final res = await _dio.get('/users/me');

    return res.data['data'];

  }



  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {

    final res = await _dio.put('/users/me', data: data);

    return res.data['data'];

  }



  Future<void> registerFcmToken(String token) async {

    await _dio.put('/users/me/fcm-token', data: {'fcmToken': token});

  }



  // Modules

  Future<List<dynamic>> getModules() async {

    final res = await _dio.get('/modules', queryParameters: {'isActive': true});

    return res.data['data'];

  }



  // Entries

  Future<Map<String, dynamic>> createEntry(Map<String, dynamic> data) async {

    final res = await _dio.post('/entries', data: data);

    return res.data['data'];

  }



  Future<Map<String, dynamic>> getEntry(String id) async {

    final res = await _dio.get('/entries/$id');

    return res.data['data'];

  }



  Future<List<dynamic>> getMyHistory({int page = 1}) async {

    final res = await _dio.get('/entries/history/me', queryParameters: {'page': page, 'limit': 20});

    return res.data['data'];

  }



  Future<Map<String, dynamic>> updateEntry(String id, Map<String, dynamic> data) async {

    final res = await _dio.put('/entries/$id', data: data);

    return res.data['data'];

  }



  Future<Map<String, dynamic>> getTodayStatus() async {

    final res = await _dio.get('/entries/today/status');

    return res.data['data'];

  }



  // Rewards

  Future<Map<String, dynamic>> getMyRewards() async {

    final res = await _dio.get('/rewards/me');

    return res.data['data'];

  }



  Future<Map<String, dynamic>> getLeaderboard({String period = 'monthly'}) async {

    final res = await _dio.get('/rewards/leaderboard', queryParameters: {'period': period});

    return res.data['data'];

  }



  // Analytics

  Future<Map<String, dynamic>> getDashboard() async {

    final res = await _dio.get('/analytics/dashboard');

    return res.data['data'];

  }



  Future<Map<String, dynamic>> getInsights() async {

    final res = await _dio.get('/analytics/insights');

    return res.data['data'];

  }



  Future<Map<String, dynamic>> getGrowth(String moduleId, String fieldSlug, {String period = 'monthly'}) async {

    final res = await _dio.get('/analytics/growth', queryParameters: {

      'moduleId': moduleId,

      'fieldSlug': fieldSlug,

      'period': period,

    });

    return res.data['data'];

  }



  // Notifications

  Future<Map<String, dynamic>> getNotifications() async {

    final res = await _dio.get('/notifications');

    return res.data['data'];

  }



  Future<void> markNotificationRead(String id) async {

    await _dio.put('/notifications/$id/read');

  }



  Future<void> markAllNotificationsRead() async {

    await _dio.put('/notifications/read-all');

  }

}

