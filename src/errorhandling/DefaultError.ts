export class DefaultError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, DefaultError.prototype);
  }
}
