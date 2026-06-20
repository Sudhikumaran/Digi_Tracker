import 'package:dio/dio.dart';

String parseApiError(dynamic error) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] != null) {
      return data['message'].toString();
    }
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timed out. Please try again.';
      case DioExceptionType.connectionError:
        return 'No internet connection. Check your network.';
      default:
        return error.message ?? 'Something went wrong';
    }
  }
  return error.toString();
}
