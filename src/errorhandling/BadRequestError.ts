export class BadRequestError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
