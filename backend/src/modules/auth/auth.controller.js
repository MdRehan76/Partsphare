const authService = require('./auth.service');
const { sendSuccess, sendCreated } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const result = await authService.register({ firstName, lastName, email, password, phone });
    return sendCreated(res, {
      message: 'Account created successfully. Welcome to PartSphere!',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, {
      message: 'Login successful.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    return sendSuccess(res, { message: 'Tokens refreshed.', data: tokens });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return sendSuccess(res, { message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, { data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe };
