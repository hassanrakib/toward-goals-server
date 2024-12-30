export default class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string, stack = '') {
    super(message);
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      // using the captureStackTrace static method to capture the error stack trace
      // and set .stack property to the instance of the AppError class
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
