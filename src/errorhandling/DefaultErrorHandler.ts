import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from './IErrorHandler';
import { ILogger } from '../utils/ILogger';
import { DefaultError } from './DefaultError';

export class DefaultErrorHandler implements ErrorHandler {
    constructor(private logger: ILogger) {}

    public handle(
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ): boolean {
        if (err instanceof DefaultError) {
            this.logger.error('Default Error', { stack: err.stack, message: err.message });
            res.status(err.statusCode || 500).json({
                error: 'Internal Server Error.',
                message: err.message,
            });
            return true;
        }
        return false;
    }
}
