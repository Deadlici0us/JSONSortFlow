import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from './IErrorHandler';
import { ILogger } from '../utils/ILogger';
import { NotFoundError } from './NotFoundError';

/**
 *
 */
export class NotFoundErrorHandler implements ErrorHandler 
{
    /**
     *
     */
    constructor(private logger: ILogger) 
{}

    /**
     * Handles not found errors.
     *
     * @param err - Error object
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function
     * @returns True if error was handled
     */
    public handle(
        err: Error,
        req: Request,
        res: Response,
        __next: NextFunction
    ): boolean 
{
        if (err instanceof NotFoundError) 
{
            const url =
                req.protocol + '://' + req.get('host') + req.originalUrl;
            const fullMessage = err.message + ' ' + url;
            // eslint-disable-next-line no-console
            console.log(' Error: ' + fullMessage);
            this.logger.error('Not Found Error', {
                message: err.message,
                url,
                stack: err.stack,
            });
            res.status(err.statusCode || 400).json({
                error: 'Not Found Error.',
                message: fullMessage,
            });
            return true;
        }
        return false;
    }
}
