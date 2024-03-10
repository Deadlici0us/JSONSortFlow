import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/ILogger";
import { ErrorHandler } from "./IErrorHandler";

export class UnexpectedErrorHandler implements ErrorHandler {
  constructor(private logger: Logger) {}

  public handle(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    this.logger.log(new Date().toString() + " " + err.stack);
    res
      .status(500)
      .json({ error: "Internal Server Error.", message: "Unexpected Error" });
  }
}
