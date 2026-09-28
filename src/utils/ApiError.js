export class ApiError extends Error {
  constructor(statusCode, message, { errorCode, errors } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = true;
  }
}
