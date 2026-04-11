import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from './IErrorHandler';
import { ILogger } from '../utils/ILogger';
import { BadRequestError } from './BadRequestError';

/**
 *
 */
export class BadRequestErrorHandler implements ErrorHandler 
{
    /**
     *
     */
    constructor(private logger: ILogger) 
{}

    /**
     * Handles bad request errors.
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
        if (err instanceof BadRequestError) 
{
            // eslint-disable-next-line no-console
            console.log(' ' + err.stack);
            this.logger.error('Bad Request Error', {
                stack: err.stack,
                message: err.message,
            });
            res.status(err.statusCode || 400).json({
                error: 'Bad Request',
                message: err.message,
            });
            return true;
        }
        return false;
    }
}
