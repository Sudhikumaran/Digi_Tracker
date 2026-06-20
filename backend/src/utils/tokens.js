const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

const generateRefreshToken = () => uuidv4();

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

const getRefreshTokenExpiry = () => {
  const days = parseInt(config.jwt.refreshExpiresIn, 10) || 7;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (config.jwt.refreshExpiresIn.includes('d') ? days : 7));
  return expiry;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  getRefreshTokenExpiry,
};
