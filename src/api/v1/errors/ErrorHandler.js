class ApiError extends Error {
  constructor(message, statusCode, path) {
    super(message);
    this.status = statusCode;
    this.message = message;
    this.path = path;
  }
}

module.exports = ApiError;
