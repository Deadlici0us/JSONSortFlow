import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "./IErrorHandler";
import { Logger } from "../utils/ILogger";
import { NotFoundError } from "./NotFoundError";

export class NotFoundErrorHandler implements ErrorHandler {
  constructor(private logger: Logger) {}

  public handle(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): boolean {
    if (err instanceof NotFoundError) {
      this.logger.log(
        new Date().toString() +
          " Error: " +
          err.message +
          " " +
          req.protocol +
          "://" +
          req.get("host") +
          req.originalUrl
      );
      res.status(err.statusCode || 400).json({
        error: "Not Found Error.",
        message:
          err.message +
          " " +
          req.protocol +
          "://" +
          req.get("host") +
          req.originalUrl,
      });
      return true;
    }
    return false;
  }
}
