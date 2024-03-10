export class NotFoundError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
