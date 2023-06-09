class AppError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Exclude constructor from error stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
