import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../utils/ILogger';
import { ErrorHandler } from './IErrorHandler';

/**
 *
 */
export class UnexpectedErrorHandler implements ErrorHandler 
{
    /**
     *
     */
    constructor(private logger: ILogger) 
{}

    /**
     * Handles unexpected errors.
     *
     * @param err - Error object or message
     * @param req - Express request object
     * @param res - Express response object
     * @returns True if error was handled
     */
    public handle(
        err: Error | null | undefined | string,
        req: Request,
        res: Response,
        __next: NextFunction
    ): boolean 
{
        const errorMessage = this.ExtractErrorMessage(err);
        // eslint-disable-next-line no-console
        console.log(' ' + errorMessage);
        this.logger.error('Unexpected Error', {
            message: errorMessage,
            stack: err instanceof Error ? err.stack : undefined,
        });
        res.status(500).json({
            error: 'Internal Server Error.',
            message: 'Unexpected Error',
        });
        return true;
    }

    /**
     * Extracts error message from error object.
     *
     * @param err - Error object or string
     * @returns Error message string
     */
    private ExtractErrorMessage(
        err: Error | null | undefined | string
    ): string 
{
        if (!this.IsErrorWithStack(err)) 
{
            return String(err);
        }
        const stack = (err as Error).stack;
        return stack || String(err);
    }

    /**
     * Checks if error has stack.
     *
     * @param err - Error to check
     * @returns True if has stack
     */
    private IsErrorWithStack(err: Error | null | undefined | string): boolean 
{
        if (!err) 
{
            return false;
        }
        if (typeof err !== 'object') 
{
            return false;
        }
        return 'stack' in err;
    }
}
