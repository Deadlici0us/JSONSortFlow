import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from './IErrorHandler';
import { ILogger } from '../utils/ILogger';
import { DefaultError } from './DefaultError';

/**
 *
 */
export class DefaultErrorHandler implements ErrorHandler 
{
    /**
     *
     */
    constructor(private logger: ILogger) 
{}

    /**
     * Handles default errors.
     *
     * @param err - Error object
     * @param req - Express request object
     * @param res - Express response object
     * @returns True if error was handled
     */
    public handle(
        err: Error,
        req: Request,
        res: Response,
        __next: NextFunction
    ): boolean 
{
        if (err instanceof DefaultError) 
{
            // eslint-disable-next-line no-console
            console.log(' ' + err.stack);
            this.logger.error('Default Error', {
                stack: err.stack,
                message: err.message,
            });
            res.status(err.statusCode || 500).json({
                error: 'Internal Server Error.',
                message: err.message,
            });
            return true;
        }
        return false;
    }
}
