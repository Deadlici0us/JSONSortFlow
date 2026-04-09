import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from './IErrorHandler';
import { ILogger } from '../utils/ILogger';
import { BadRequestError } from './BadRequestError';

export class BadRequestErrorHandler implements ErrorHandler {
    constructor(private logger: ILogger) {}

    public handle(
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ): boolean {
        if (err instanceof BadRequestError) {
            console.log(' ' + err.stack);
            this.logger.error('Bad Request Error', { stack: err.stack, message: err.message });
            res.status(err.statusCode || 400).json({
                error: 'Bad Request',
                message: err.message,
            });
            return true;
        }
        return false;
    }
}
