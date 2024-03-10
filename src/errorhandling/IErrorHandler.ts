import { Request, Response, NextFunction } from "express";

export interface ErrorHandler {
  handle(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): boolean | void;
}
