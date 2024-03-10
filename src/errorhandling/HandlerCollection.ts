import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "./IErrorHandler";

export class HandlerCollection implements ErrorHandler {
  private errorHandlers: ErrorHandler[];
  private unexpectedErrorHandler: ErrorHandler;

  constructor(
    errorHandlers: ErrorHandler[],
    unexpectedErrorHandler: ErrorHandler
  ) {
    this.errorHandlers = errorHandlers;
    this.unexpectedErrorHandler = unexpectedErrorHandler;
  }

  public addErrorHandler(errorHandler: ErrorHandler): void {
    this.errorHandlers.push(errorHandler);
  }

  public handle(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    let handled = false;

    this.errorHandlers.forEach((errorHandler) => {
      if (errorHandler.handle(err, req, res, next)) {
        handled = true;
      }
    });

    if (!handled) {
      this.unexpectedErrorHandler.handle(err, req, res, next);
    }
  }
}
