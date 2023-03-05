const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, type: "refresh" },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME,
    }
  );
};
const generatePasswordResetToken = (data) => {
  return jwt.sign({ id: data._id }, process.env.PASSWORD_RESET_TOKEN, {
    expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRE_TIME,
  });
};

const generateEmailConfirmToken = (data) => {
  return jwt.sign(
    { id: data._id },
    process.env.SIGNUP_EMAIL_CONFIRMATION_TOKEN,
    { expiresIn: process.env.SIGNUP_EMAIL_CONFIRMATION_TOKEN_EXPIRE_TIME }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  generateEmailConfirmToken,
};
