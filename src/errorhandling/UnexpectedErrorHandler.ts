import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../utils/ILogger';
import { ErrorHandler } from './IErrorHandler';

export class UnexpectedErrorHandler implements ErrorHandler {
    constructor(private logger: ILogger) {}

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
        console.log(' ' + errorMessage);
        this.logger.error('Unexpected Error', { 
            message: errorMessage,
            stack: err instanceof Error ? err.stack : undefined 
        });
        res.status(500).json({
            error: 'Internal Server Error.',
            message: 'Unexpected Error',
        });
        return true;
    }
}
