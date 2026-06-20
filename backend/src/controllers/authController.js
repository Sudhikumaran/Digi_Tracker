const { asyncHandler, sendSuccess } = require('../utils/helpers');
const { authService } = require('../services');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 'Registration successful', 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  sendSuccess(res, result, 'Login successful');
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, result, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body.refreshToken);
  sendSuccess(res, result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, result);
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  sendSuccess(res, result);
});

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
