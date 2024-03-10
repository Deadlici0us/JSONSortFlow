import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "./IErrorHandler";
import { Logger } from "../utils/ILogger";
import { DefaultError } from "./DefaultError";

export class DefaultErrorHandler implements ErrorHandler {
  constructor(private logger: Logger) {}

  public handle(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): boolean {
    if (err instanceof DefaultError) {
      this.logger.log(new Date().toString() + " " + err.stack);
      res
        .status(err.statusCode || 500)
        .json({ error: "Internal Server Error.", message: err.message });
      return true;
    }
    return false;
  }
}
