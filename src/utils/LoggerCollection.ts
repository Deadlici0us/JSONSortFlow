import { ILogger } from './ILogger';

/**
 * Logger collection that delegates logging to multiple loggers.
 * Useful for logging to multiple destinations simultaneously.
 */
export class LoggerCollection implements ILogger 
{
    private readonly loggers: ILogger[];

    /**
     *
     */
    constructor(loggers: ILogger[]) 
{
        this.loggers = loggers;
    }

    /**
     *
     */
    public info(message: string, meta?: unknown): void 
{
        this.loggers.forEach((logger) => 
{
            logger.info(message, meta);
        });
    }

    /**
     *
     */
    public warn(message: string, meta?: unknown): void 
{
        this.loggers.forEach((logger) => 
{
            logger.warn(message, meta);
        });
    }

    /**
     *
     */
    public error(message: string, meta?: unknown): void 
{
        this.loggers.forEach((logger) => 
{
            logger.error(message, meta);
        });
    }

    /**
     *
     */
    public debug(message: string, meta?: unknown): void 
{
        this.loggers.forEach((logger) => 
{
            logger.debug(message, meta);
        });
    }
}
