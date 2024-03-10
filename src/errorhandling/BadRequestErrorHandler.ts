import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "./IErrorHandler";
import { Logger } from "../utils/ILogger";
import { BadRequestError } from "./BadRequestError";

export class BadRequestErrorHandler implements ErrorHandler {
  constructor(private logger: Logger) {}

  public handle(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): boolean {
    if (err instanceof BadRequestError) {
      this.logger.log(new Date().toString() + " " + err.stack);
      res
        .status(err.statusCode || 400)
        .json({ error: "Bad Request", message: err.message });
      return true;
    }
    return false;
  }
}
