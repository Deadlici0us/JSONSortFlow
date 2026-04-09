import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/ILogger';
import { ErrorHandler } from './IErrorHandler';

export class UnexpectedErrorHandler implements ErrorHandler {
    constructor(private logger: Logger) {}

    public handle(
        err: Error | null | undefined | string,
        req: Request,
        res: Response,
        next: NextFunction
    ): boolean {
        const errorMessage =
            err && typeof err === 'object' && 'stack' in err
                ? (err as Error).stack
                : String(err);
        this.logger.log(new Date().toString() + ' ' + errorMessage);
        res.status(500).json({
            error: 'Internal Server Error.',
            message: 'Unexpected Error',
        });
        return true;
    }
}
